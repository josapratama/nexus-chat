"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Upload, FileText, Trash2, Search } from "lucide-react";
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

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        fetchDocuments();
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchDocuments();
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
        setSearchResults(data.results);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Chat
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Documents (RAG)
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Upload documents to chat with your own data. The AI will use these
            as context when answering questions.
          </p>
        </div>

        {/* Upload */}
        <div className="mb-6 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center dark:border-gray-600 dark:bg-gray-900">
          <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Upload text, markdown, CSV, or JSON files
          </p>
          <label>
            <input
              type="file"
              accept=".txt,.md,.csv,.json,.pdf"
              onChange={handleUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button disabled={uploading}>
              <span>{uploading ? "Uploading..." : "Choose File"}</span>
            </Button>
          </label>
        </div>

        {/* Search */}
        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search across your documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searching || !searchQuery.trim()}>
              <Search className="h-4 w-4 mr-1" />
              {searching ? "Searching..." : "Search"}
            </Button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Results
              </h3>
              {searchResults.map((result, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {result.documentName}
                    </span>
                    <span className="text-xs text-gray-400">
                      Score: {result.score}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap line-clamp-4">
                    {result.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Your Documents
          </h2>

          {documents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {doc.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(doc.fileSize)} • {doc._count.chunks}{" "}
                        chunks • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
