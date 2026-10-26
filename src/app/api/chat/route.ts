import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  getProviderInstance,
  getModelById,
  type AIProvider,
} from "@/lib/ai/providers";
import { searchChunks } from "@/lib/rag/chunker";

interface UploadedFileAttachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  isImage?: boolean;
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response(
      JSON.stringify({ error: "Sesi telah berakhir. Silakan login kembali." }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  // Rate limiting
  const { success, remaining, resetIn } = rateLimit(`chat:${session.user.id}`);
  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Batas permintaan terlampaui (rate limit). Tunggu sebentar sebelum mengirim pesan lagi.",
        resetIn: Math.ceil(resetIn / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
        },
      },
    );
  }

  const body = await request.json();
  let {
    messages,
    conversationId,
    model,
    provider,
    systemPrompt,
    attachments,
    isRegenerate,
  } = body;

  // If provider/model not in request body, try to get from conversation
  if (conversationId && (!provider || !model)) {
    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { model: true, provider: true, systemPrompt: true },
    });
    if (conv) {
      provider = provider || conv.provider;
      model = model || conv.model;
      systemPrompt = systemPrompt || conv.systemPrompt;
    }
  }

  if (!messages || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "Daftar pesan tidak valid." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const modelInfo = getModelById(model, provider);
  if (!modelInfo && provider !== "ollama") {
    return new Response(
      JSON.stringify({ error: `Model '${model}' tidak didukung untuk provider '${provider}'.` }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Check if user has their own API key for this provider (BYOK)
  let apiKey: string | undefined;
  const userApiKey = await prisma.userApiKey.findUnique({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider: provider,
      },
    },
  });

  if (userApiKey?.apiKey) {
    apiKey = userApiKey.apiKey;
  }

  const isOllama = provider === "ollama";
  const systemKey =
    provider === "openai" ? process.env.OPENAI_API_KEY :
    provider === "anthropic" ? process.env.ANTHROPIC_API_KEY :
    provider === "google" ? process.env.GOOGLE_GENERATIVE_AI_API_KEY :
    provider === "mistral" ? process.env.MISTRAL_API_KEY :
    provider === "openrouter" ? process.env.OPENROUTER_API_KEY :
    undefined;

  const effectiveKey = (apiKey || systemKey || "").trim();

  // Validate API key for cloud providers
  if (!isOllama && !effectiveKey) {
    return new Response(
      JSON.stringify({
        error: `API Key untuk provider **${provider.toUpperCase()}** belum disetel. Silakan tambahkan API Key Anda di menu [Settings](/settings) (fitur BYOK), atau ubah provider ke **Ollama (Local)** untuk AI lokal gratis.`,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  // Validate Ollama availability and model download
  if (isOllama) {
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
      const tagsRes = await fetch(`${ollamaUrl}/api/tags`, {
        signal: AbortSignal.timeout(2500),
      });

      if (tagsRes.ok) {
        const data = await tagsRes.json();
        const installedModels = (data.models || []).map((m: { name: string }) => m.name);
        const hasModel = installedModels.some(
          (m: string) => m === model || m.startsWith(`${model}:`) || model.startsWith(`${m}:`),
        );

        if (installedModels.length === 0) {
          return new Response(
            JSON.stringify({
              error: `Belum ada model AI yang di-download di Ollama. Jalankan perintah ini di server:\n\n\`docker compose exec ollama ollama pull ${model}\``,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        if (!hasModel) {
          return new Response(
            JSON.stringify({
              error: `Model Ollama **${model}** belum di-download. Model yang terpasang saat ini: \`${installedModels.join(", ")}\`.\n\nUntuk mendownload model ini, jalankan:\n\`docker compose exec ollama ollama pull ${model}\``,
            }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }
      }
    } catch {
      return new Response(
        JSON.stringify({
          error: `Tidak dapat terhubung ke service Ollama (${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}). Pastikan container Ollama sedang berjalan.`,
        }),
        { status: 503, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  // Extract latest user message text
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  let latestUserQuery = "";
  if (lastUserMessage) {
    if (typeof lastUserMessage.content === "string") {
      latestUserQuery = lastUserMessage.content;
    } else if (Array.isArray(lastUserMessage.parts)) {
      latestUserQuery = lastUserMessage.parts
        .filter((p: { type: string }) => p.type === "text")
        .map((p: { text: string }) => p.text)
        .join("");
    }
  }

  // RAG: Query relevant document chunks from user documents
  let ragContext = "";
  try {
    const userChunks = await prisma.documentChunk.findMany({
      where: { document: { userId: session.user.id } },
      select: {
        content: true,
        chunkIndex: true,
        document: { select: { name: true } },
      },
      take: 200,
    });

    if (userChunks.length > 0 && latestUserQuery.trim()) {
      const scored = searchChunks(
        latestUserQuery,
        userChunks.map((c) => ({
          content: c.content,
          chunkIndex: c.chunkIndex,
        })),
        3,
      );

      if (scored.length > 0) {
        const contextParts = scored.map((item, idx) => {
          const original = userChunks.find(
            (u) =>
              u.chunkIndex === item.chunkIndex && u.content === item.content,
          );
          return `[Document: ${original?.document?.name || "Uploaded Document"} (Excerpt #${idx + 1})]:\n${item.content}`;
        });
        ragContext = contextParts.join("\n\n");
      }
    }
  } catch (err) {
    console.error("RAG retrieval error:", err);
  }

  // Convert UI messages to model messages
  const modelMessages = await convertToModelMessages(messages as UIMessage[]);

  // Build combined system prompt with RAG context
  let finalSystemPrompt = systemPrompt || "";
  if (ragContext) {
    finalSystemPrompt =
      (finalSystemPrompt ? `${finalSystemPrompt}\n\n` : "") +
      `Relevant context retrieved from user documents:\n${ragContext}\n\nPlease use this information when responding to the user's questions.`;
  }

  // Add system prompt if provided or if RAG found context
  if (finalSystemPrompt) {
    modelMessages.unshift({ role: "system", content: finalSystemPrompt });
  }

  // If regenerating, remove last assistant response from DB first
  if (isRegenerate && conversationId) {
    const lastAssistant = await prisma.message.findFirst({
      where: { conversationId, role: "assistant" },
      orderBy: { createdAt: "desc" },
    });
    if (lastAssistant) {
      await prisma.message.delete({ where: { id: lastAssistant.id } });
    }
  }

  // Save user message to database if not regenerating
  if (conversationId && !isRegenerate && lastUserMessage && latestUserQuery) {
    const createdMsg = await prisma.message.create({
      data: {
        conversationId,
        role: "user",
        content: latestUserQuery,
      },
    });

    // Save attachments if any
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      for (const att of attachments as UploadedFileAttachment[]) {
        await prisma.messageAttachment.create({
          data: {
            messageId: createdMsg.id,
            fileName: att.fileName || "attachment",
            fileType: att.fileType || "application/octet-stream",
            fileSize: att.fileSize || 0,
            url: att.url,
          },
        });
      }
    }
  }

  try {
    const providerInstance = getProviderInstance(provider as AIProvider, effectiveKey);

    const result = streamText({
      model: providerInstance(model),
      messages: modelMessages,
      onError: ({ error }) => {
        console.error("Stream generation error:", error);
      },
      onFinish: async ({ text, usage }) => {
        // Save assistant message
        if (conversationId && text) {
          await prisma.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: text,
              tokenCount: usage?.totalTokens ?? undefined,
            },
          });

          // Update conversation title if it's the first exchange
          const messageCount = await prisma.message.count({
            where: { conversationId },
          });
          if (messageCount <= 2 && latestUserQuery) {
            const title =
              latestUserQuery.length > 50
                ? latestUserQuery.substring(0, 50) + "..."
                : latestUserQuery;
            await prisma.conversation.update({
              where: { id: conversationId },
              data: { title },
            });
          }
        }

        // Record usage
        if (usage) {
          await prisma.usageRecord.create({
            data: {
              userId: session.user.id,
              conversationId,
              provider,
              model,
              promptTokens: usage.inputTokens || 0,
              completionTokens: usage.outputTokens || 0,
              totalTokens: usage.totalTokens || 0,
            },
          });
        }
      },
    });

    return result.toTextStreamResponse({
      headers: {
        "X-RateLimit-Remaining": String(remaining),
      },
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Gagal memproses panggilan ke provider AI.";
    console.error("Chat generation exception:", err);
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
