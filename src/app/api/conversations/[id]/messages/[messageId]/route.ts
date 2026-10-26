import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId, messageId } = await params;
  const { content } = await request.json();

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { error: "Content is required" },
      { status: 400 },
    );
  }

  // Verify conversation belongs to user
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
  });

  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const message = await prisma.message.findFirst({
    where: { id: messageId, conversationId },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // Update message
  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { content },
  });

  // Delete subsequent assistant messages so regenerated response takes over
  if (message.role === "user") {
    await prisma.message.deleteMany({
      where: {
        conversationId,
        createdAt: { gt: message.createdAt },
      },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; messageId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId, messageId } = await params;

  // Verify conversation belongs to user
  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
  });

  if (!conv) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 },
    );
  }

  const message = await prisma.message.findFirst({
    where: { id: messageId, conversationId },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  // If deleting user message, also delete the subsequent assistant response
  if (message.role === "user") {
    const nextAssistant = await prisma.message.findFirst({
      where: {
        conversationId,
        role: "assistant",
        createdAt: { gt: message.createdAt },
      },
      orderBy: { createdAt: "asc" },
    });

    if (nextAssistant) {
      await prisma.message.delete({ where: { id: nextAssistant.id } });
    }
  }

  await prisma.message.delete({ where: { id: messageId } });

  return NextResponse.json({ success: true });
}
