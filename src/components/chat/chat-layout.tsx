"use client";

import { Sidebar } from "./sidebar";
import { ChatArea } from "./chat-area";

export function ChatLayout() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      <Sidebar />
      <ChatArea />
    </div>
  );
}
