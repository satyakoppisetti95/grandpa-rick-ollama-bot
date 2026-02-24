"use client";

import { useEffect, useRef } from "react";

interface ChatBoxProps {
  messages: { role: "user" | "assistant"; content: string }[];
  onNewConversation: () => void;
  className?: string;
  fillContainer?: boolean;
  darkMode?: boolean;
}

const CHAT_BOX_WIDTH = 320;
const CHAT_BOX_HEIGHT = 420;

function formatTimestamp() {
  const d = new Date();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `Today, ${time}`;
}

export function ChatBox({
  messages,
  onNewConversation,
  className = "",
  fillContainer = false,
  darkMode = false,
}: ChatBoxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const dark = fillContainer && darkMode;

  return (
    <aside
      className={`flex flex-col overflow-hidden ${className} ${
        dark ? "bg-transparent" : "bg-white"
      } ${
        fillContainer
          ? "min-h-0 w-full h-full border-0 shadow-none"
          : "rounded-xl shrink-0 border border-gray-200/80 shadow-lg bg-white"
      }`}
      style={
        fillContainer
          ? undefined
          : {
              width: CHAT_BOX_WIDTH,
              height: CHAT_BOX_HEIGHT,
              minWidth: CHAT_BOX_WIDTH,
              minHeight: CHAT_BOX_HEIGHT,
            }
      }
      aria-label="Conversation"
    >
      {!fillContainer && (
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-200 bg-gray-50 shrink-0">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Conversation
          </span>
          <button
            type="button"
            onClick={onNewConversation}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow transition-all duration-200 active:shadow-none active:translate-y-px focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1"
          >
            New conversation
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto overflow-x-hidden p-3 min-h-0 flex flex-col gap-3 ${
          dark ? "bg-transparent" : "bg-white"
        }`}
      >
        {messages.length === 0 ? (
          <p className={`text-sm italic pt-2 ${dark ? "text-white/40" : "text-gray-400"}`}>
            No messages yet. Start talking!
          </p>
        ) : (
          <>
            <p className={`text-xs text-center py-1 ${dark ? "text-white/30" : "text-gray-400"}`}>
              {formatTimestamp()}
            </p>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={
                    dark
                      ? `max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-blue-500/80 text-white rounded-br-md"
                            : "bg-white/10 text-white/90 rounded-bl-md"
                        }`
                      : `chat-bubble ${
                          msg.role === "user"
                            ? "chat-bubble-user"
                            : "chat-bubble-assistant"
                        }`
                  }
                >
                  <div className="whitespace-pre-wrap break-words">
                    {msg.content || <span className="opacity-60 italic">…</span>}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
