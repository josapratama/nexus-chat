"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface ApiKeyEntry {
  id: string;
  provider: string;
  label: string | null;
  apiKey: string;
  createdAt: string;
}

const PROVIDERS = [
  { value: "openai", label: "OpenAI", placeholder: "sk-..." },
  { value: "anthropic", label: "Anthropic", placeholder: "sk-ant-..." },
  { value: "google", label: "Google AI", placeholder: "AIza..." },
  { value: "mistral", label: "Mistral", placeholder: "..." },
];

export function SettingsForm() {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [newProvider, setNewProvider] = useState("openai");
  const [newApiKey, setNewApiKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const res = await fetch("/api/user/api-keys");
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error("Failed to fetch API keys:", error);
    }
  }

  async function handleSaveKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newApiKey.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: newProvider,
          apiKey: newApiKey,
          label: newLabel || undefined,
        }),
      });

      if (res.ok) {
        setMessage("API key saved successfully");
        setNewApiKey("");
        setNewLabel("");
        fetchApiKeys();
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to save API key");
      }
    } catch {
      setMessage("Failed to save API key");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteKey(provider: string) {
    try {
      const res = await fetch(`/api/user/api-keys?provider=${provider}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchApiKeys();
        setMessage("API key deleted");
      }
    } catch {
      setMessage("Failed to delete API key");
    }
  }

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/chat"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Chat
      </Link>

      {/* Current API Keys */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="h-5 w-5" />
          Your API Keys
        </h2>

        {apiKeys.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No API keys configured. Add your own keys below to use your own
            quota, or use the system-provided keys.
          </p>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
              >
                <div>
                  <p className="font-medium text-sm text-gray-900 dark:text-white">
                    {PROVIDERS.find((p) => p.value === key.provider)?.label ||
                      key.provider}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {key.apiKey}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteKey(key.provider)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Add New Key */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add API Key
        </h2>

        <form onSubmit={handleSaveKey} className="space-y-4">
          {message && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provider
            </label>
            <select
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key
            </label>
            <Input
              type="password"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              placeholder={
                PROVIDERS.find((p) => p.value === newProvider)?.placeholder
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Label (optional)
            </label>
            <Input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="e.g. Personal, Work"
            />
          </div>

          <Button type="submit" disabled={loading || !newApiKey.trim()}>
            <Save className="h-4 w-4 mr-1" />
            {loading ? "Saving..." : "Save API Key"}
          </Button>
        </form>
      </section>

      {/* Info */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          How it works
        </h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            • If you add your own API key, it will be used for that provider.
          </li>
          <li>
            • If no personal key is set, the system default key will be used.
          </li>
          <li>• Your keys are stored securely and never shared.</li>
          <li>• Ollama models run locally and don&apos;t need an API key.</li>
        </ul>
      </section>
    </div>
  );
}
