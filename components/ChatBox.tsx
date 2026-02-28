"use client";

import { useEffect, useRef } from "react";

interface ChatBoxProps {
  messages: { role: "user" | "assistant"; content: string }[];
  onNewConversation: () => void;
  /** When provided, assistant messages show a voice icon to re-play TTS. */
  onSpeakMessage?: (text: string) => void;
  /** Only assistant messages whose content is in this set show the voice icon (after TTS has been synthesized once). */
  synthesizedMessageContents?: Set<string>;
  /** When true, the voice icon is disabled (e.g. while another message is playing). */
  isPlayingAudio?: boolean;
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

function SpeakerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
      <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
    </svg>
  );
}

export function ChatBox({
  messages,
  onNewConversation,
  onSpeakMessage,
  synthesizedMessageContents,
  isPlayingAudio = false,
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
                  <div className="flex items-end gap-1.5">
                    <div className="whitespace-pre-wrap break-words min-w-0 flex-1">
                      {msg.content || <span className="opacity-60 italic">…</span>}
                    </div>
                    {msg.role === "assistant" &&
                      onSpeakMessage &&
                      (msg.content?.trim() ?? "") &&
                      synthesizedMessageContents?.has(msg.content.trim()) && (
                      <button
                        type="button"
                        onClick={() => onSpeakMessage(msg.content)}
                        disabled={isPlayingAudio}
                        className={`shrink-0 p-1 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                          dark
                            ? "text-white/70 hover:bg-white/15 hover:text-white focus:ring-white/40 disabled:hover:bg-transparent"
                            : "text-gray-500 hover:bg-gray-200 hover:text-gray-700 focus:ring-gray-300 disabled:hover:bg-transparent"
                        }`}
                        aria-label="Play again"
                        title="Play again"
                      >
                        <SpeakerIcon className="w-4 h-4" />
                      </button>
                    )}
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
