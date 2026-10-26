"use client";

import { useEffect, useState } from "react";
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

  const [ollamaModels, setOllamaModels] = useState<Array<{ id: string; name: string }>>([]);

  const providers: { value: AIProvider; label: string }[] = [
    { value: "ollama", label: "Ollama (Local)" },
    { value: "openrouter", label: "OpenRouter" },
    { value: "openai", label: "OpenAI" },
    { value: "anthropic", label: "Anthropic" },
    { value: "google", label: "Google" },
    { value: "mistral", label: "Mistral" },
  ];

  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("/api/models");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.ollamaModels)) {
            setOllamaModels(data.ollamaModels);
          }
        }
      } catch (err) {
        console.error("Failed to load models list:", err);
      }
    }
    loadModels();
  }, []);

  // Compute model options
  const baseModels = AVAILABLE_MODELS.filter(
    (m) => m.provider === selectedProvider,
  );

  let modelOptions = baseModels.map((m) => ({
    value: m.id,
    label: m.name,
  }));

  // If Ollama is selected, append any installed Ollama models not yet in the list
  if (selectedProvider === "ollama") {
    const existingIds = new Set(baseModels.map((m) => m.id));
    const extraOllama = ollamaModels
      .filter((m) => !existingIds.has(m.id))
      .map((m) => ({
        value: m.id,
        label: `${m.name} (Installed)`,
      }));
    modelOptions = [...modelOptions, ...extraOllama];
  }

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
    <div className="flex items-center gap-1.5 sm:gap-2">
      <Select
        value={selectedProvider}
        onChange={handleProviderChange}
        options={providers}
        className="w-28 sm:w-36"
      />
      <Select
        value={selectedModel}
        onChange={handleModelChange}
        options={modelOptions}
        className="w-32 sm:w-44"
      />
    </div>
  );
}
