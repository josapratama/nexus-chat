import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");

  const prompts = await prisma.promptTemplate.findMany({
    where: {
      OR: [{ userId: session.user.id }, { isPublic: true }],
      ...(category ? { category } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      content: true,
      category: true,
      isPublic: true,
      userId: true,
      createdAt: true,
    },
  });

  return NextResponse.json(prompts);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, content, category, isPublic } =
    await request.json();

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 },
    );
  }

  const prompt = await prisma.promptTemplate.create({
    data: {
      userId: session.user.id,
      title,
      description,
      content,
      category: category || "general",
      isPublic: isPublic || false,
    },
  });

  return NextResponse.json(prompt, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Prompt ID required" }, { status: 400 });
  }

  await prisma.promptTemplate.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
