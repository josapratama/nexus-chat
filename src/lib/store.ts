import { create } from "zustand";

export interface Conversation {
  id: string;
  title: string;
  model: string;
  provider: string;
  systemPrompt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  selectedModel: string;
  selectedProvider: string;

  setConversations: (conversations: Conversation[]) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  setIsLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedModel: (model: string) => void;
  setSelectedProvider: (provider: string) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isSidebarOpen: true,
  selectedModel: "gpt-4o",
  selectedProvider: "openai",

  setConversations: (conversations) => set({ conversations }),
  setActiveConversation: (id) => set({ activeConversationId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  updateLastMessage: (content) =>
    set((state) => {
      const messages = [...state.messages];
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          content,
        };
      }
      return { messages };
    }),
  setIsLoading: (isLoading) => set({ isLoading }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
}));
