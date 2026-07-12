"use client";

import { useEffect } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore, type Conversation } from "@/lib/store";
import { cn, truncate } from "@/lib/utils";

export function Sidebar() {
  const {
    conversations,
    activeConversationId,
    isSidebarOpen,
    setConversations,
    setActiveConversation,
    setMessages,
    toggleSidebar,
    selectedModel,
    selectedProvider,
  } = useChatStore();

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
        // Update selected model/provider to match conversation
        useChatStore.getState().setSelectedModel(conversation.model);
        useChatStore.getState().setSelectedProvider(conversation.provider);
        // Set active conversation AFTER messages are loaded
        setActiveConversation(conversation.id);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }

  if (!isSidebarOpen) return null;

  return (
    <aside className="flex h-full w-72 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold dark:text-white">Chats</h2>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={createNewChat}
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            title="Close Sidebar"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 text-sm">
            <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
            <p>No conversations yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => selectConversation(conversation)}
                className={cn(
                  "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                  activeConversationId === conversation.id
                    ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
                    : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate">
                  {truncate(conversation.title, 30)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) =>
                    exportConversation(conversation.id, "markdown", e)
                  }
                  title="Export as Markdown"
                >
                  <Download className="h-3 w-3 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => deleteConversation(conversation.id, e)}
                >
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
