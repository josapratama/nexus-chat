"use client";

import { useChatStore } from "@/lib/store";
import { AVAILABLE_MODELS, type AIProvider } from "@/lib/ai/providers";
import { Select } from "@/components/ui/select";

export function ModelSelector() {
  const {
    selectedModel,
    selectedProvider,
    activeConversationId,
    setSelectedModel,
    setSelectedProvider,
  } = useChatStore();

  const providers: { value: AIProvider; label: string }[] = [
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "google", label: "Google" },
    { value: "mistral", label: "Mistral" },
    { value: "ollama", label: "Ollama (Local)" },
  ];

  const modelsForProvider = AVAILABLE_MODELS.filter(
    (m) => m.provider === selectedProvider,
  );

  async function updateConversation(model: string, provider: string) {
    if (activeConversationId) {
      try {
        await fetch(`/api/conversations/${activeConversationId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, provider }),
        });
      } catch (error) {
        console.error("Failed to update conversation:", error);
      }
    }
  }

  function handleProviderChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const provider = e.target.value as AIProvider;
    setSelectedProvider(provider);
    // Auto-select first model of new provider
    const firstModel = AVAILABLE_MODELS.find((m) => m.provider === provider);
    if (firstModel) {
      setSelectedModel(firstModel.id);
      updateConversation(firstModel.id, provider);
    }
  }

  function handleModelChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedModel(e.target.value);
    updateConversation(e.target.value, selectedProvider);
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedProvider}
        onChange={handleProviderChange}
        options={providers}
        className="w-36"
      />
      <Select
        value={selectedModel}
        onChange={handleModelChange}
        options={modelsForProvider.map((m) => ({
          value: m.id,
          label: m.name,
        }))}
        className="w-44"
      />
    </div>
  );
}
