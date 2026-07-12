"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  BookOpen,
  Code,
  Briefcase,
  Lightbulb,
  PenTool,
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
  { value: "all", label: "All", icon: BookOpen },
  { value: "general", label: "General", icon: Lightbulb },
  { value: "coding", label: "Coding", icon: Code },
  { value: "writing", label: "Writing", icon: PenTool },
  { value: "business", label: "Business", icon: Briefcase },
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
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetchPrompts();
  }, [activeCategory]);

  async function fetchPrompts() {
    const params =
      activeCategory !== "all" ? `?category=${activeCategory}` : "";
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
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/prompts?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchPrompts();
      }
    } catch (error) {
      console.error("Failed to delete prompt:", error);
    }
  }

  async function handleCopy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Chat
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Prompt Library
            </h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            New Prompt
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900 space-y-4"
          >
            <Input
              placeholder="Prompt title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <Input
              placeholder="Short description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
            <Textarea
              placeholder="Prompt content... Use {{variable}} for placeholders"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              required
            />
            <div className="flex items-center gap-4">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              >
                {CATEGORIES.filter((c) => c.value !== "all").map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input
                  type="checkbox"
                  checked={newIsPublic}
                  onChange={(e) => setNewIsPublic(e.target.checked)}
                  className="rounded"
                />
                Public (visible to all users)
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Prompt</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
              >
                <Icon className="h-4 w-4 mr-1" />
                {cat.label}
              </Button>
            );
          })}
        </div>

        {/* Prompts Grid */}
        {prompts.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No prompts yet. Create your first one!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {prompt.title}
                  </h3>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleCopy(prompt.id, prompt.content)}
                    >
                      <Copy
                        className={cn(
                          "h-3.5 w-3.5",
                          copied === prompt.id
                            ? "text-green-500"
                            : "text-gray-500",
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(prompt.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </div>
                </div>
                {prompt.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {prompt.description}
                  </p>
                )}
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-hidden max-h-24 whitespace-pre-wrap">
                  {prompt.content}
                </pre>
                <div className="flex items-center gap-2 mt-3">
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                    {prompt.category}
                  </span>
                  {prompt.isPublic && (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Public
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
