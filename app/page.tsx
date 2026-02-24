"use client";

import { Character } from "@/components/Character";
import { ChatBox } from "@/components/ChatBox";
import { useVoiceChat } from "@/hooks/useVoiceChat";

export default function Home() {
  const {
    expression,
    status,
    error,
    interimText,
    toggleListening,
    displayMessages,
    startNewConversation,
  } = useVoiceChat();

  return (
    <main className="min-h-screen flex flex-col p-4 md:p-6">
      <div className="text-center mb-2">
        <h1 className="text-2xl font-semibold text-white/95 tracking-tight">
          Talk to your character
        </h1>
        <p className="text-sm text-white/60 mt-1">Press Space to start or stop listening</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row gap-4 md:gap-6 items-center sm:items-stretch justify-center min-h-0 w-full max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[260px] shrink-0">
          <Character expression={expression} animateMouthWhenSpeaking />
          <div className="mt-4 w-full max-w-md space-y-2">
            <p className="text-sm text-white/80 min-h-[1.5rem]">{status}</p>
            {interimText && (
              <p className="text-sm text-white/50 italic">&ldquo;{interimText}&rdquo;</p>
            )}
            {error && (
              <p className="text-sm text-red-400/90" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={toggleListening}
              className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-white text-sm font-medium transition-colors focus:outline-none focus:ring 2px focus:ring-purple-400"
            >
              {expression === "listening" ? "Stop listening" : "Start listening"}
            </button>
          </div>
        </div>

        <ChatBox
          messages={displayMessages}
          onNewConversation={startNewConversation}
          className="w-full min-w-[260px] max-w-[340px] shrink-0 self-center"
        />
      </div>
    </main>
  );
}
