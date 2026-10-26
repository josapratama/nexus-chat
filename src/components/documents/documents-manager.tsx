"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  Search,
  Bot,
  Database,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
} from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  name: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  _count: { chunks: number };
}

interface SearchResult {
  content: string;
  score: number;
  documentName: string;
  documentId: string;
}

export function DocumentsManager() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  }

  async function uploadFile(file: File) {
    setUploading(true);
    setStatusMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setStatusMessage({ type: "success", text: `"${file.name}" berhasil diunggah dan diindeks ke memori RAG!` });
        fetchDocuments();
      } else {
        const data = await res.json();
        setStatusMessage({ type: "error", text: data.error || "Gagal mengunggah dokumen." });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatusMessage({ type: "error", text: "Terjadi kesalahan saat mengunggah file." });
    } finally {
      setUploading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus dokumen "${name}" beserta semua indeks memorinya?`)) return;
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
        setStatusMessage({ type: "success", text: `Dokumen "${name}" telah dihapus.` });
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await fetch("/api/documents/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, topK: 5 }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  const totalChunks = documents.reduce((acc, doc) => acc + (doc._count?.chunks || 0), 0);
  const totalSize = documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-purple-600/10 blur-[130px] rounded-full" />
        <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-indigo-500/10 blur-[130px] rounded-full" />
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
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
                <Database className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold text-sm text-white">RAG Knowledge Base</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <Sparkles className="h-3 w-3" />
              <span>{totalChunks} Chunks Indexed</span>
            </span>
          </div>
        </div>
      </header>

      {/* Content Container */}
      <main className="relative mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
        {/* Status Message */}
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

        {/* Page Hero & Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-3xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <Bot className="h-4 w-4" />
              <span>Augmented Generation Memory</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Document Knowledge Base
            </h1>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Unggah dokumen PDF, Markdown, atau teks untuk memberikan referensi langsung ke AI. Ketika Anda bertanya di ruang chat, sistem akan mencari potongan dokumen yang relevan untuk menjawab dengan akurasi tinggi.
            </p>
          </div>

          {/* Quick Metrics Card */}
          <div className="rounded-3xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950 p-6 backdrop-blur-xl flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Memory Snapshot</span>
            <div className="my-3 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Total Dokumen:</span>
                <span className="text-sm font-bold text-white">{documents.length} File</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs text-slate-400">Total Potongan (Chunks):</span>
                <span className="text-sm font-bold text-indigo-400">{totalChunks} Chunks</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Ukuran Terindeks:</span>
                <span className="text-sm font-bold text-emerald-400">{formatFileSize(totalSize)}</span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <HardDrive className="h-3 w-3 text-slate-400" />
              <span>Tersimpan lokal di database PostgreSQL.</span>
            </div>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative rounded-3xl border-2 border-dashed p-8 text-center transition-all ${
            dragActive
              ? "border-blue-500 bg-blue-500/10 shadow-xl shadow-blue-500/10"
              : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/20 mb-4">
            {uploading ? (
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            ) : (
              <Upload className="h-6 w-6" />
            )}
          </div>
          <h3 className="text-base font-semibold text-white">
            {uploading ? "Sedang memproses & memotong dokumen..." : "Tarik & Lepas File di Sini atau Klik untuk Memilih"}
          </h3>
          <p className="mt-1 text-xs text-slate-400 max-w-md mx-auto">
            Mendukung file teks: <span className="text-slate-300 font-mono">.pdf, .md, .txt, .json, .csv</span> hingga 25MB per file.
          </p>

          <label className="mt-5 inline-block">
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.pdf"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <span
              className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 cursor-pointer transition hover:from-blue-500 hover:to-indigo-500 active:scale-95 ${
                uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? "Mengindeks..." : "Pilih File dari Komputer"}</span>
            </span>
          </label>
        </div>

        {/* Semantic Search Tester */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2">
            <Search className="h-3.5 w-3.5" />
            <span>Semantic Search Explorer</span>
          </div>
          <h2 className="text-lg font-bold text-white">Uji Pencarian Konteks Dokumen</h2>
          <p className="mt-1 text-xs text-slate-400">
            Ketik pertanyaan atau kata kunci untuk melihat potongan teks yang akan disuntikkan ke prompt AI saat obrolan berlangsung.
          </p>

          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Contoh: apa kebijakan pengembalian dana atau ringkasan teknis?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5" />
                  <span>Cari</span>
                </>
              )}
            </button>
          </form>

          {/* Search Results Display */}
          {searchResults.length > 0 && (
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400">
                Ditemukan {searchResults.length} potongan yang cocok:
              </span>
              <div className="space-y-3">
                {searchResults.map((result, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-slate-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                        <FileText className="h-3 w-3" />
                        <span>{result.documentName}</span>
                      </span>
                      <span className="text-xs font-mono text-emerald-400">
                        Score: {result.score.toFixed(3)}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-300 font-mono whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      {result.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Daftar Dokumen Tersimpan</h2>
              <p className="text-xs text-slate-400 mt-0.5">Kelola dokumen pengetahuan RAG pribadi Anda</p>
            </div>
            <span className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1 text-xs font-mono text-slate-400">
              {documents.length} Dokumen
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
              <FileCode className="h-10 w-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">Belum ada dokumen yang diunggah</p>
              <p className="text-xs text-slate-500 mt-1">Unggah file pertama Anda di atas untuk mengaktifkan fitur RAG.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="group relative flex items-center justify-between p-4 rounded-2xl border border-slate-800/90 bg-slate-950/70 transition hover:border-slate-700 hover:bg-slate-950"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate" title={doc.name}>
                        {doc.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span className="text-indigo-400 font-medium">{doc._count?.chunks || 0} chunks</span>
                        <span>•</span>
                        <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id, doc.name)}
                    className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition hover:border-rose-500/40 hover:bg-rose-500/10 hover:text-rose-400"
                    title="Hapus Dokumen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
