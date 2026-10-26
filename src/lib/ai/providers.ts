import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";

export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "mistral"
  | "ollama"
  | "openrouter";

export interface ModelInfo {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  maxTokens: number;
  supportsVision: boolean;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    description: "Most capable OpenAI model",
    maxTokens: 128000,
    supportsVision: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    description: "Fast and affordable",
    maxTokens: 128000,
    supportsVision: true,
  },
  {
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo",
    provider: "openai",
    description: "Previous generation flagship",
    maxTokens: 128000,
    supportsVision: true,
  },
  // Anthropic
  {
    id: "claude-sonnet-4-20250514",
    name: "Claude Sonnet 4",
    provider: "anthropic",
    description: "Latest Claude model",
    maxTokens: 200000,
    supportsVision: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    description: "Best balance of speed and intelligence",
    maxTokens: 200000,
    supportsVision: true,
  },
  {
    id: "claude-3-haiku-20240307",
    name: "Claude 3 Haiku",
    provider: "anthropic",
    description: "Fastest Claude model",
    maxTokens: 200000,
    supportsVision: true,
  },
  // Google
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "google",
    description: "Fast and versatile",
    maxTokens: 1000000,
    supportsVision: true,
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    description: "Advanced reasoning",
    maxTokens: 2000000,
    supportsVision: true,
  },
  // Mistral
  {
    id: "mistral-large-latest",
    name: "Mistral Large",
    provider: "mistral",
    description: "Most capable Mistral model",
    maxTokens: 128000,
    supportsVision: false,
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small",
    provider: "mistral",
    description: "Fast and efficient",
    maxTokens: 128000,
    supportsVision: false,
  },
  // OpenRouter
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek R1",
    provider: "openrouter",
    description: "Open reasoning model with o1-level performance",
    maxTokens: 128000,
    supportsVision: false,
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V3",
    provider: "openrouter",
    description: "High performance open weights model",
    maxTokens: 128000,
    supportsVision: false,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet (OpenRouter)",
    provider: "openrouter",
    description: "Flagship intelligence via OpenRouter",
    maxTokens: 200000,
    supportsVision: true,
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o (OpenRouter)",
    provider: "openrouter",
    description: "OpenAI flagship via OpenRouter",
    maxTokens: 128000,
    supportsVision: true,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "openrouter",
    description: "Meta's flagship open model",
    maxTokens: 128000,
    supportsVision: false,
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Gemini 2.0 Flash (OpenRouter)",
    provider: "openrouter",
    description: "Next-gen multimodal speed",
    maxTokens: 1000000,
    supportsVision: true,
  },
  // Ollama (local)
  {
    id: "llama3.1",
    name: "Llama 3.1",
    provider: "ollama",
    description: "Meta's open model (local)",
    maxTokens: 128000,
    supportsVision: false,
  },
  {
    id: "mistral",
    name: "Mistral 7B",
    provider: "ollama",
    description: "Mistral local model",
    maxTokens: 32000,
    supportsVision: false,
  },
  {
    id: "llava",
    name: "LLaVA",
    provider: "ollama",
    description: "Vision model (local)",
    maxTokens: 4096,
    supportsVision: true,
  },
  {
    id: "codellama",
    name: "Code Llama",
    provider: "ollama",
    description: "Code-focused model (local)",
    maxTokens: 16000,
    supportsVision: false,
  },
];

export function getProviderInstance(provider: AIProvider, apiKey?: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      });
    case "anthropic":
      return createAnthropic({
        apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
      });
    case "google":
      return createGoogleGenerativeAI({
        apiKey: apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      });
    case "mistral":
      return createMistral({
        apiKey: apiKey || process.env.MISTRAL_API_KEY,
      });
    case "openrouter":
      return createOpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: apiKey || process.env.OPENROUTER_API_KEY,
        headers: {
          "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
          "X-Title": "NexusChat",
        },
      });
    case "ollama":
      return createOpenAI({
        baseURL: process.env.OLLAMA_BASE_URL
          ? `${process.env.OLLAMA_BASE_URL}/v1`
          : "http://localhost:11434/v1",
        apiKey: "ollama", // Ollama doesn't need a real key
      });
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export function getModelById(
  modelId: string,
  provider?: string,
): ModelInfo | undefined {
  const found = AVAILABLE_MODELS.find((m) => m.id === modelId);
  if (found) return found;
  if (provider === "ollama") {
    return {
      id: modelId,
      name: modelId,
      provider: "ollama",
      description: "Local Ollama model",
      maxTokens: 128000,
      supportsVision: modelId.toLowerCase().includes("llava") || modelId.toLowerCase().includes("vision"),
    };
  }
  if (provider === "openrouter") {
    return {
      id: modelId,
      name: modelId.split("/").pop() || modelId,
      provider: "openrouter",
      description: "OpenRouter model",
      maxTokens: 128000,
      supportsVision: true,
    };
  }
  return undefined;
}

export function getModelsByProvider(provider: AIProvider): ModelInfo[] {
  return AVAILABLE_MODELS.filter((m) => m.provider === provider);
}
