import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/lib/ai/providers";

export async function GET() {
  // Also try to fetch Ollama models dynamically
  let ollamaModels: Array<{ id: string; name: string }> = [];

  try {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });

    if (response.ok) {
      const data = await response.json();
      ollamaModels =
        data.models?.map((m: { name: string }) => ({
          id: m.name,
          name: m.name,
        })) || [];
    }
  } catch {
    // Ollama not available, that's fine
  }

  return NextResponse.json({
    models: AVAILABLE_MODELS,
    ollamaModels,
  });
}
