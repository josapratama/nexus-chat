import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const body = await request.json().catch(() => ({}));
  const { upToMessageId, messageIndex } = body as {
    upToMessageId?: string;
    messageIndex?: number;
  };

  // Find source conversation and its messages
  const sourceConv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!sourceConv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  // Determine which messages to include in the fork
  let targetMessages = sourceConv.messages;
  if (upToMessageId) {
    const targetIdx = sourceConv.messages.findIndex((m) => m.id === upToMessageId);
    if (targetIdx !== -1) {
      targetMessages = sourceConv.messages.slice(0, targetIdx + 1);
    }
  } else if (typeof messageIndex === "number" && messageIndex >= 0) {
    targetMessages = sourceConv.messages.slice(0, messageIndex + 1);
  }

  // Create new branched conversation
  const forkedConv = await prisma.conversation.create({
    data: {
      title: `Branch: ${sourceConv.title.replace(/^Branch:\s*/, "")}`,
      userId: session.user.id,
      model: sourceConv.model,
      provider: sourceConv.provider,
      systemPrompt: sourceConv.systemPrompt,
      messages: {
        create: targetMessages.map((m) => ({
          role: m.role,
          content: m.content,
          tokenCount: m.tokenCount,
        })),
      },
    },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(forkedConv, { status: 201 });
}

