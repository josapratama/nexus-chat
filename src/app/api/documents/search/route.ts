import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { searchChunks } from "@/lib/rag/chunker";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { query, documentIds, topK = 3 } = await request.json();

  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  // Get chunks from user's documents
  const whereClause: Record<string, unknown> = {
    document: { userId: session.user.id },
  };

  if (documentIds && documentIds.length > 0) {
    whereClause.documentId = { in: documentIds };
  }

  const chunks = await prisma.documentChunk.findMany({
    where: whereClause,
    select: {
      content: true,
      chunkIndex: true,
      document: { select: { name: true, id: true } },
    },
  });

  // Search through chunks
  const results = searchChunks(
    query,
    chunks.map((c) => ({ content: c.content, chunkIndex: c.chunkIndex })),
    topK,
  );

  // Map back to include document info
  const enrichedResults = results.map((result) => {
    const originalChunk = chunks.find(
      (c) => c.chunkIndex === result.chunkIndex && c.content === result.content,
    );
    return {
      content: result.content,
      score: result.score,
      documentName: originalChunk?.document.name,
      documentId: originalChunk?.document.id,
    };
  });

  return NextResponse.json({ results: enrichedResults });
}
