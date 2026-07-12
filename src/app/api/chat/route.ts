import { streamText, type UIMessage, convertToModelMessages } from "ai";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import {
  getProviderInstance,
  getModelById,
  type AIProvider,
} from "@/lib/ai/providers";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Rate limiting
  const { success, remaining, resetIn } = rateLimit(`chat:${session.user.id}`);
  if (!success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded",
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
  let { messages, conversationId, model, provider, systemPrompt } = body;

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
    return new Response("Messages are required", { status: 400 });
  }

  const modelInfo = getModelById(model);
  if (!modelInfo) {
    return new Response(`Invalid model: ${model}`, { status: 400 });
  }

  // Check if user has their own API key for this provider
  let apiKey: string | undefined;
  const userApiKey = await prisma.userApiKey.findUnique({
    where: {
      userId_provider: {
        userId: session.user.id,
        provider: provider,
      },
    },
  });

  if (userApiKey) {
    apiKey = userApiKey.apiKey;
  }

  // Get provider instance
  const providerInstance = getProviderInstance(provider as AIProvider, apiKey);

  // Convert UI messages to model messages
  const modelMessages = await convertToModelMessages(messages as UIMessage[]);

  // Add system prompt if provided
  if (systemPrompt) {
    modelMessages.unshift({ role: "system", content: systemPrompt });
  }

  // Save user message to database
  if (conversationId) {
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage?.role === "user") {
      const textContent =
        lastUserMessage.parts
          ?.filter((p: { type: string }) => p.type === "text")
          .map((p: { text: string }) => p.text)
          .join("") || "";
      if (textContent) {
        await prisma.message.create({
          data: {
            conversationId,
            role: "user",
            content: textContent,
          },
        });
      }
    }
  }

  const result = streamText({
    model: providerInstance(model),
    messages: modelMessages,
    onFinish: async ({ text, usage }) => {
      // Save assistant message
      if (conversationId) {
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
        if (messageCount <= 2) {
          const firstUserMsg = messages.find(
            (m: { role: string }) => m.role === "user",
          );
          const textParts = firstUserMsg?.parts?.filter(
            (p: { type: string }) => p.type === "text",
          );
          const firstText = textParts?.[0]?.text || "New Chat";
          const title =
            firstText.length > 50
              ? firstText.substring(0, 50) + "..."
              : firstText;
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
}
