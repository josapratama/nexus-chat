"use client";

import { useState, useEffect } from "react";
import {
  Key,
  Trash2,
  Plus,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Sparkles,
  Lock,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";

interface ApiKeyEntry {
  id: string;
  provider: string;
  apiKey: string;
  label: string | null;
  createdAt: string;
}

const PROVIDERS = [
  {
    value: "openrouter",
    label: "OpenRouter",
    placeholder: "sk-or-v1-...",
    hintUrl: "https://openrouter.ai/keys",
    badge: "Multi-Model & DeepSeek",
  },
  {
    value: "openai",
    label: "OpenAI",
    placeholder: "sk-...",
    hintUrl: "https://platform.openai.com/api-keys",
    badge: "GPT-4o & o1",
  },
  {
    value: "anthropic",
    label: "Anthropic",
    placeholder: "sk-ant-...",
    hintUrl: "https://console.anthropic.com/settings/keys",
    badge: "Claude 3.5 Sonnet",
  },
  {
    value: "google",
    label: "Google AI Studio",
    placeholder: "AIza...",
    hintUrl: "https://aistudio.google.com/app/apikey",
    badge: "Gemini 2.0 Flash",
  },
  {
    value: "mistral",
    label: "Mistral AI",
    placeholder: "...",
    hintUrl: "https://console.mistral.ai/api-keys/",
    badge: "Mistral Large",
  },
];

interface SettingsFormProps {
  user?: {
    name?: string | null;
    email?: string | null;
    role?: string;
  };
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyEntry[]>([]);
  const [newProvider, setNewProvider] = useState("openrouter");
  const [newApiKey, setNewApiKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
    setStatusMessage(null);
    try {
      const res = await fetch("/api/user/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: newProvider,
          apiKey: newApiKey.trim(),
          label: newLabel.trim() || undefined,
        }),
      });

      if (res.ok) {
        setStatusMessage({ type: "success", text: `API Key untuk ${newProvider.toUpperCase()} berhasil disimpan!` });
        setNewApiKey("");
        setNewLabel("");
        fetchApiKeys();
      } else {
        const data = await res.json();
        setStatusMessage({ type: "error", text: data.error || "Gagal menyimpan API key." });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Terjadi kesalahan sistem saat menyimpan key." });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteKey(provider: string) {
    if (!confirm(`Hapus API Key untuk ${provider.toUpperCase()}?`)) return;
    try {
      const res = await fetch(`/api/user/api-keys?provider=${provider}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchApiKeys();
        setStatusMessage({ type: "success", text: `API key ${provider.toUpperCase()} berhasil dihapus.` });
      }
    } catch {
      setStatusMessage({ type: "error", text: "Gagal menghapus API key." });
    }
  }

  const selectedProviderConfig = PROVIDERS.find((p) => p.value === newProvider) || PROVIDERS[0];

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Navbar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <Link
          href="/chat"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Chat</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
          <Shield className="h-3 w-3" />
          <span>BYOK (Bring Your Own Keys)</span>
        </span>
      </div>

      {/* Header Info */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Account & Model Settings
        </h1>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-2xl">
          Kelola kunci API pribadi Anda untuk mengakses cloud model (OpenRouter, OpenAI, Claude, Gemini). Jika kunci tidak diisi, sistem akan menggunakan API key bawaan server atau model lokal Ollama.
        </p>

        {user && (
          <div className="mt-4 flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3.5 w-3.5 text-indigo-400" />
              <span>{user.name || "User"}</span>
            </span>
            <span>•</span>
            <span className="font-mono text-slate-400">{user.email}</span>
            <span>•</span>
            <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-400 border border-indigo-500/20 uppercase">
              Role: {user.role || "USER"}
            </span>
          </div>
        )}
      </div>

      {/* Status Feedback */}
      {statusMessage && (
        <div
          className={`flex items-start gap-3 rounded-2xl border p-4 text-xs sm:text-sm backdrop-blur-md transition-all ${
            statusMessage.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          )}
          <span className="flex-1">{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Configured Keys Card */}
      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Kunci API Terkonfigurasi</h2>
              <p className="text-xs text-slate-400">Kunci yang aktif di akun Anda</p>
            </div>
          </div>
          <span className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-mono text-slate-400">
            {apiKeys.length} Kunci
          </span>
        </div>

        {apiKeys.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
            <Lock className="h-8 w-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">Belum ada API key pribadi yang disimpan</p>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Anda tetap bisa langsung memakai AI lokal dengan memilih provider <b>Ollama (Local)</b> gratis tanpa API key, atau tambahkan key Anda di bawah.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {apiKeys.map((key) => {
              const prov = PROVIDERS.find((p) => p.value === key.provider);
              return (
                <div
                  key={key.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/90 bg-slate-950/80 transition hover:border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">
                          {prov?.label || key.provider.toUpperCase()}
                        </span>
                        {key.label && (
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                            {key.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {key.apiKey}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteKey(key.provider)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                    title="Hapus API Key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add / Update API Key Form */}
      <section className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Plus className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Tambahkan / Perbarui Kunci API</h2>
            <p className="text-xs text-slate-400">Pilih provider dan masukkan token API Anda</p>
          </div>
        </div>

        <form onSubmit={handleSaveKey} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                AI Provider
              </label>
              <select
                value={newProvider}
                onChange={(e) => setNewProvider(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  API Key Secret
                </label>
                <a
                  href={selectedProviderConfig.hintUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                >
                  <span>Dapatkan Key {selectedProviderConfig.label}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder={selectedProviderConfig.placeholder}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-3.5 pr-10 py-2.5 text-sm font-mono text-white placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition"
                  title={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Label Catatan (Opsional)
            </label>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Contoh: Akun Kantor, Proyek Personal"
              className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !newApiKey.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? "Menyimpan..." : "Simpan Kunci API"}</span>
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
