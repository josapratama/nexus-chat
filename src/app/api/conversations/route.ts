import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      model: true,
      provider: true,
      systemPrompt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { model, provider, systemPrompt } = await request.json();

  const conversation = await prisma.conversation.create({
    data: {
      userId: session.user.id,
      model: model || "gpt-4o",
      provider: provider || "openai",
      systemPrompt,
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
