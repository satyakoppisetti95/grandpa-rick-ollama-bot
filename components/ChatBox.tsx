"use client";

import { useEffect, useRef } from "react";

interface ChatBoxProps {
  messages: { role: "user" | "assistant"; content: string }[];
  onNewConversation: () => void;
  className?: string;
}

export function ChatBox({
  messages,
  onNewConversation,
  className = "",
}: ChatBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  return (
    <aside
      className={`flex flex-col rounded-xl border border-white/20 bg-black/30 backdrop-blur-sm overflow-hidden min-h-[220px] ${className}`}
      style={{ minWidth: "280px", maxWidth: "360px" }}
      aria-label="Conversation"
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="text-xs font-medium text-white/70 uppercase tracking-wider">
          Conversation
        </span>
        <button
          type="button"
          onClick={onNewConversation}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/90 transition-colors focus:outline-none focus:ring 1px focus:ring-white/30"
        >
          New conversation
        </button>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px] max-h-[min(60vh,420px)]"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-white/40 italic">No messages yet. Press Space to talk.</p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg px-3 py-2 text-sm ${
                msg.role === "user"
                  ? "bg-[var(--accent)]/30 text-white/95 ml-4"
                  : "bg-white/5 text-white/85 mr-4"
              }`}
            >
              <span className="text-[10px] font-medium text-white/50 uppercase block mb-1">
                {msg.role === "user" ? "You" : "Character"}
              </span>
              <div className="whitespace-pre-wrap break-words">
                {msg.content || (
                  <span className="text-white/40 italic">…</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
