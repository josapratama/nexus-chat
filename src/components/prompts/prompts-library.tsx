"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  BookOpen,
  Code,
  Briefcase,
  Lightbulb,
  PenTool,
  Sparkles,
  MessageSquare,
  Lock,
  Globe,
  X,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PromptTemplate {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  isPublic: boolean;
  userId: string | null;
  createdAt: string;
}

const CATEGORIES = [
  { value: "all", label: "Semua", icon: BookOpen },
  { value: "general", label: "Umum", icon: Lightbulb },
  { value: "coding", label: "Coding", icon: Code },
  { value: "writing", label: "Menulis", icon: PenTool },
  { value: "business", label: "Bisnis", icon: Briefcase },
];

export function PromptsLibrary() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, [activeCategory]);

  async function fetchPrompts() {
    const params = activeCategory !== "all" ? `?category=${activeCategory}` : "";
    try {
      const res = await fetch(`/api/prompts${params}`);
      if (res.ok) {
        const data = await res.json();
        setPrompts(data);
      }
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription || undefined,
          content: newContent,
          category: newCategory,
          isPublic: newIsPublic,
        }),
      });

      if (res.ok) {
        setNewTitle("");
        setNewDescription("");
        setNewContent("");
        setShowForm(false);
        fetchPrompts();
      }
    } catch (error) {
      console.error("Failed to create prompt:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus template prompt ini?")) return;
    try {
      const res = await fetch(`/api/prompts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  }

  async function copyPrompt(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-amber-500/15 via-indigo-600/15 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-10 left-0 w-[450px] h-[450px] bg-blue-500/10 blur-[130px] rounded-full" />
      </div>

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Chat</span>
            </Link>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xs">
                <BookOpen className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-sm text-white">Prompt Library</span>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 active:scale-95"
          >
            {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            <span>{showForm ? "Tutup Form" : "Buat Prompt Baru"}</span>
          </button>
        </div>
      </header>

      {/* Content Container */}
      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
        {/* Page Hero */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
            <Sparkles className="h-4 w-4" />
            <span>Productivity Accelerators</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Template Prompt Kustom
          </h1>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-3xl">
            Simpan instruksi, sistem prompt, dan template pertanyaan berulang untuk mempermudah pekerjaan sehari-hari. Salin dengan satu klik untuk digunakan langsung di ruang obrolan.
          </p>
        </div>

        {/* Create Prompt Form (Collapsible) */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-3xl border border-indigo-500/30 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl animate-fade-in space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                <span>Tambah Prompt Baru</span>
              </h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Judul Prompt *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Refactor Kode TypeScript Clean"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="general">General / Umum</option>
                  <option value="coding">Coding & Software</option>
                  <option value="writing">Writing & Copywriting</option>
                  <option value="business">Business & Analytics</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Deskripsi Singkat (Opsional)
              </label>
              <input
                type="text"
                placeholder="Jelaskan kegunaan prompt ini secara singkat..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Isi Prompt *
              </label>
              <textarea
                rows={4}
                placeholder="Tuliskan instruksi lengkap prompt di sini..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 text-sm text-white placeholder:text-slate-500 font-mono transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={newIsPublic}
                  onChange={(e) => setNewIsPublic(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Bagikan ke publik (dapat dilihat pengguna lain di sistem)</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? "Menyimpan..." : "Simpan Prompt"}</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800/80">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition active:scale-95",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "border border-slate-800 bg-slate-900/60 text-slate-400 hover:bg-slate-900 hover:text-white",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Prompts Cards Grid */}
        {prompts.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
            <BookOpen className="h-10 w-10 mx-auto text-slate-600 mb-3" />
            <p className="text-base font-semibold text-slate-300">Belum ada template prompt di kategori ini</p>
            <p className="text-xs text-slate-500 mt-1">Klik tombol &quot;Buat Prompt Baru&quot; di atas untuk menambahkan template pertama Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prompts.map((p) => (
              <div
                key={p.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-900/70 p-5 backdrop-blur-xl transition hover:border-slate-700 hover:bg-slate-900/90"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[11px] font-semibold text-blue-400 border border-blue-500/20 capitalize">
                      {p.category}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {p.isPublic ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                          <Globe className="h-3 w-3" /> Publik
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Lock className="h-3 w-3" /> Pribadi
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                    {p.title}
                  </h3>

                  {p.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Content Preview */}
                  <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {p.content}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                      title="Hapus Prompt"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => copyPrompt(p.id, p.content)}
                      className="flex items-center gap-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:text-white"
                      title="Salin ke Clipboard"
                    >
                      {copiedId === p.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-semibold">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
