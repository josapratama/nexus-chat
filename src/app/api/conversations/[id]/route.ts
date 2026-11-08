import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(conversation);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Whitelist safe update fields to prevent unauthorized mutations
  const updateData: {
    title?: string;
    model?: string;
    provider?: string;
    systemPrompt?: string | null;
    temperature?: number | null;
  } = {};

  if (typeof body.title === "string") updateData.title = body.title.trim();
  if (typeof body.model === "string") updateData.model = body.model;
  if (typeof body.provider === "string") updateData.provider = body.provider;
  if (body.systemPrompt !== undefined) updateData.systemPrompt = body.systemPrompt;
  if (typeof body.temperature === "number") updateData.temperature = body.temperature;

  const conversation = await prisma.conversation.updateMany({
    where: { id, userId: session.user.id },
    data: updateData,
  });

  if (conversation.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const conversation = await prisma.conversation.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (conversation.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
