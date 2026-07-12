import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";

export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "mistral"
  | "ollama";

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

export function getModelById(modelId: string): ModelInfo | undefined {
  return AVAILABLE_MODELS.find((m) => m.id === modelId);
}

export function getModelsByProvider(provider: AIProvider): ModelInfo[] {
  return AVAILABLE_MODELS.filter((m) => m.provider === provider);
}
