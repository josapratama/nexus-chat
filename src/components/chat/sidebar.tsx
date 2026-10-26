"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Download,
  Search,
  BookOpen,
  FileText,
  Settings,
  Shield,
  X,
  Sparkles,
  LogOut,
  User as UserIcon,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore, type Conversation } from "@/lib/store";
import { cn, truncate } from "@/lib/utils";
import Link from "next/link";
import { signOut } from "next-auth/react";

export function Sidebar() {
  const {
    conversations,
    activeConversationId,
    isSidebarOpen,
    setConversations,
    setActiveConversation,
    setMessages,
    toggleSidebar,
    setSidebarOpen,
    selectedModel,
    selectedProvider,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }

  async function createNewChat() {
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: selectedModel,
          provider: selectedProvider,
        }),
      });

      if (res.ok) {
        const conversation = await res.json();
        setConversations([conversation, ...conversations]);
        setActiveConversation(conversation.id);
        setMessages([]);
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConversations(conversations.filter((c) => c.id !== id));
        if (activeConversationId === id) {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }

  function exportConversation(
    id: string,
    format: "markdown" | "json",
    e: React.MouseEvent,
  ) {
    e.stopPropagation();
    window.open(`/api/conversations/${id}/export?format=${format}`, "_blank");
  }

  async function selectConversation(conversation: Conversation) {
    try {
      const res = await fetch(`/api/conversations/${conversation.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        useChatStore.getState().setSelectedModel(conversation.model);
        useChatStore.getState().setSelectedProvider(conversation.provider);
        setActiveConversation(conversation.id);
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-slate-800/80 bg-slate-950 transition-all duration-300 md:static md:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:-ml-64",
        )}
      >
        {/* Header: Logo & Close */}
        <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 text-white shadow-xs">
              <Bot className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              Nexus<span className="text-blue-400">Chat</span>
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-900"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Action: New Chat Button */}
        <div className="px-3 py-1.5">
          <button
            type="button"
            onClick={createNewChat}
            className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 shadow-sm transition hover:bg-slate-800 hover:border-slate-700 active:scale-[0.99]"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-3.5 w-3.5 text-blue-400" />
              <span>New chat</span>
            </div>
            <span className="text-[10px] text-slate-400 border border-slate-800 rounded px-1.5 py-0.2">
              Ctrl+K
            </span>
          </button>
        </div>

        {/* Search Input */}
        {conversations.length > 3 && (
          <div className="px-3 py-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-200"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1.5 space-y-0.5">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center text-gray-400 text-xs">
              <MessageSquare className="h-6 w-6 mb-1.5 opacity-30 text-gray-400" />
              <p>{searchQuery ? "No chats found" : "No chats yet"}</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const isActive = activeConversationId === conversation.id;
              return (
                <div
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={cn(
                    "group relative flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-normal cursor-pointer transition-colors",
                    isActive
                      ? "bg-slate-800 text-white font-medium border border-slate-700/60 shadow-xs"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200",
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      isActive ? "text-blue-400" : "text-slate-500",
                    )}
                  />
                  <span className="flex-1 truncate">
                    {truncate(conversation.title, 24)}
                  </span>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => exportConversation(conversation.id, "markdown", e)}
                      className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                      title="Export Markdown"
                    >
                      <Download className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      className="rounded p-1 text-slate-400 hover:bg-rose-950/40 hover:text-rose-400"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation (Clean, Monochromatic, Unified) */}
        <div className="border-t border-slate-800/80 p-2 space-y-0.5 text-xs text-slate-400">
          <Link
            href="/documents"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-900 hover:text-white"
          >
            <FileText className="h-4 w-4 text-slate-400" />
            <span>Documents (RAG)</span>
          </Link>
          <Link
            href="/prompts"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-900 hover:text-white"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            <span>Prompt Library</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-900 hover:text-white"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Settings</span>
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-900 hover:text-white"
          >
            <Shield className="h-4 w-4 text-slate-400" />
            <span>Admin Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-rose-400 transition hover:bg-rose-950/30"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
