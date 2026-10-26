import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: conversationId } = await params;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

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

  if (action === "last-assistant") {
    // Delete the most recent assistant message (used for regeneration)
    const lastAssistant = await prisma.message.findFirst({
      where: { conversationId, role: "assistant" },
      orderBy: { createdAt: "desc" },
    });

    if (lastAssistant) {
      await prisma.message.delete({ where: { id: lastAssistant.id } });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
