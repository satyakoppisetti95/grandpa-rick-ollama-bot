"use client";

import { useState, useEffect } from "react";
import { Character } from "@/components/Character";
import { ChatBox } from "@/components/ChatBox";
import { useVoiceChat } from "@/hooks/useVoiceChat";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [sidebarOpen]);

  const {
    expression,
    status,
    error,
    interimText,
    displayMessages,
    startNewConversation,
  } = useVoiceChat();

  return (
    <>
      {/* Hamburger toggle — always visible top-left */}
      <button
        type="button"
        onClick={() => setSidebarOpen((o) => !o)}
        className="fixed top-4 left-4 z-[60] w-10 h-10 rounded-lg flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors"
        aria-expanded={sidebarOpen}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        <span className="relative block w-5 h-4">
          <span
            className={`absolute left-0 block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${
              sidebarOpen ? "top-[7px] rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${
              sidebarOpen ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100"
            }`}
          />
          <span
            className={`absolute left-0 block h-0.5 w-full bg-current rounded-full transition-all duration-300 ${
              sidebarOpen ? "top-[7px] -rotate-45" : "top-[14px]"
            }`}
          />
        </span>
      </button>

      {/* Backdrop */}
      <div
        role="button"
        tabIndex={-1}
        onClick={() => setSidebarOpen(false)}
        className={`fixed inset-0 z-[49] bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          sidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!sidebarOpen}
        style={sidebarOpen ? undefined : { visibility: "hidden" }}
      />

      {/* Side nav — slides in from the left */}
      <nav
        className={`fixed top-0 left-0 z-[55] h-full w-[min(85vw,340px)] flex flex-col
          bg-[#1a1f2e] border-r border-white/10
          transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          boxShadow: sidebarOpen ? "4px 0 24px rgba(0,0,0,0.4)" : "none",
          pointerEvents: sidebarOpen ? "auto" : "none",
        }}
        aria-label="Chat sidebar"
        aria-hidden={!sidebarOpen}
      >
        {/* Nav header — left-padded to avoid overlapping the hamburger */}
        <header className="flex items-center justify-between shrink-0 pl-14 pr-4 py-3 border-b border-white/10">
          <span className="text-sm font-semibold text-white/90 tracking-wide">
            Conversations
          </span>
          <button
            type="button"
            onClick={startNewConversation}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
          >
            + New chat
          </button>
        </header>

        {/* Chat area fills the rest */}
        <div className="flex-1 min-h-0 flex flex-col">
          <ChatBox
            messages={displayMessages}
            onNewConversation={startNewConversation}
            fillContainer
            darkMode
          />
        </div>
      </nav>

      {/* Main content */}
      <main className="min-h-screen flex flex-col items-center p-4 md:p-6">
        <div className="w-full max-w-4xl flex flex-col flex-1">
          <header className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-semibold text-white/95 tracking-tight">
              Talk to your character
            </h1>
            <p className="text-sm text-white/60 mt-1.5">
              Press Space to start or stop listening.
            </p>
          </header>

          <div className="flex-1 flex flex-col min-h-0 w-full justify-center items-center">
            <div className="flex flex-col items-center justify-center flex-shrink-0 w-full sm:w-[420px]">
              <Character expression={expression} animateMouthWhenSpeaking />
              <div className="mt-5 w-full max-w-[320px] space-y-2 text-center">
                <p className="text-sm text-white/80 min-h-[1.5rem]">{status}</p>
                {interimText && (
                  <p className="text-sm text-white/50 italic">&ldquo;{interimText}&rdquo;</p>
                )}
                {error && (
                  <p className="text-sm text-red-400/90" role="alert">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
