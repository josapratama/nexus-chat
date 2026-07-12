import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chunkText } from "@/lib/rag/chunker";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      fileName: true,
      fileType: true,
      fileSize: true,
      createdAt: true,
      _count: { select: { chunks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const name = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = [
      "text/plain",
      "text/markdown",
      "application/pdf",
      "text/csv",
      "application/json",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Only text, markdown, CSV, JSON, and PDF files are supported",
        },
        { status: 400 },
      );
    }

    // Extract text content
    let content: string;
    if (file.type === "application/pdf") {
      // For PDF, we store raw text extraction (basic)
      // In production, use a proper PDF parser like pdf-parse
      content = await file.text();
    } else {
      content = await file.text();
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "File appears to be empty" },
        { status: 400 },
      );
    }

    // Chunk the content
    const chunks = chunkText(content, {
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    // Save document and chunks
    const document = await prisma.document.create({
      data: {
        userId: session.user.id,
        name: name || file.name,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        content,
        chunks: {
          create: chunks.map((chunk, index) => ({
            content: chunk,
            chunkIndex: index,
          })),
        },
      },
      include: {
        _count: { select: { chunks: true } },
      },
    });

    return NextResponse.json(
      {
        id: document.id,
        name: document.name,
        chunksCount: document._count.chunks,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Document upload error:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Document ID required" },
      { status: 400 },
    );
  }

  await prisma.document.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
