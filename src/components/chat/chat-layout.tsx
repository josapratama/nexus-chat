"use client";

import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";

export function ChatLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
