/**
 * Simple text chunker for RAG.
 * Splits text into overlapping chunks for better context retrieval.
 */

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const { chunkSize = 1000, chunkOverlap = 200 } = options;

  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at a sentence or paragraph boundary
    if (end < text.length) {
      const lastParagraph = text.lastIndexOf("\n\n", end);
      const lastSentence = text.lastIndexOf(". ", end);
      const lastNewline = text.lastIndexOf("\n", end);

      if (lastParagraph > start + chunkSize / 2) {
        end = lastParagraph + 2;
      } else if (lastSentence > start + chunkSize / 2) {
        end = lastSentence + 2;
      } else if (lastNewline > start + chunkSize / 2) {
        end = lastNewline + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - chunkOverlap;

    if (start >= text.length) break;
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

/**
 * Simple keyword-based search for chunks.
 * For production, use vector embeddings with pgvector or similar.
 */
export function searchChunks(
  query: string,
  chunks: { content: string; chunkIndex: number }[],
  topK: number = 3,
): { content: string; chunkIndex: number; score: number }[] {
  const queryTerms = query.toLowerCase().split(/\s+/);

  const scored = chunks.map((chunk) => {
    const contentLower = chunk.content.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      if (term.length < 3) continue;
      const regex = new RegExp(term, "gi");
      const matches = contentLower.match(regex);
      if (matches) {
        score += matches.length;
      }
    }

    // Boost for exact phrase match
    if (contentLower.includes(query.toLowerCase())) {
      score += 10;
    }

    return { ...chunk, score };
  });

  return scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
