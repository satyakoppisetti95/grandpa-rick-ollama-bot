"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterExpression } from "@/components/Character";
import type { ChatMessage } from "@/lib/services/ollama";
import { WebSpeechSTTService } from "@/lib/services/speech-to-text";
import { OllamaClient } from "@/lib/services/ollama";
import type { TextToSpeechService } from "@/lib/services/text-to-speech";
import {
  WebSpeechTTSService,
  RemoteTTSService,
} from "@/lib/services/text-to-speech";

const DEFAULT_SYSTEM_PROMPT =
  "The assistant is a 38 year old bitter man who rages at the world.";
const OLLAMA_SYSTEM_PROMPT =
  process.env.NEXT_PUBLIC_OLLAMA_SYSTEM_PROMPT || DEFAULT_SYSTEM_PROMPT;

export function useVoiceChat() {
  const [expression, setExpression] = useState<CharacterExpression>("idle");
  const [status, setStatus] = useState<string>("Press Space to start listening");
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const finalTranscriptRef = useRef("");

  const sttRef = useRef<WebSpeechSTTService | null>(null);
  const ttsRef = useRef<TextToSpeechService | null>(null);
  const ollamaRef = useRef<OllamaClient | null>(null);
  /** Full conversation history for context (system + user + assistant turns). */
  const conversationRef = useRef<ChatMessage[]>([
    { role: "system", content: OLLAMA_SYSTEM_PROMPT },
  ]);

  /** Messages to show in the side chat box (user + assistant only, for display). */
  const [displayMessages, setDisplayMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const isListeningRef = useRef(false);
  const isProcessingRef = useRef(false);
  /** True only when user pressed Space to stop; then onEnd will send to Ollama. Browser-only end does not send. */
  const userStoppedRef = useRef(false);

  const getSTT = useCallback(() => {
    if (!sttRef.current) sttRef.current = new WebSpeechSTTService();
    return sttRef.current;
  }, []);

  const getTTS = useCallback((): TextToSpeechService => {
    if (!ttsRef.current) {
      const ttsUrl = process.env.NEXT_PUBLIC_TTS_SERVER_URL;
      const remote = ttsUrl ? new RemoteTTSService(ttsUrl) : null;
      ttsRef.current =
        remote?.isSupported() ? remote : new WebSpeechTTSService();
    }
    return ttsRef.current;
  }, []);

  const getOllama = useCallback(() => {
    if (!ollamaRef.current) ollamaRef.current = new OllamaClient();
    return ollamaRef.current;
  }, []);

  const stopListening = useCallback(() => {
    const stt = getSTT();
    if (!stt.isListening()) return;
    userStoppedRef.current = true;
    stt.stopListening();
    isListeningRef.current = false;
    setIsListening(false);
    setInterimText("");
    // Don't set expression/status here — onEnd will either run processTranscript (→ thinking) or set idle
  }, [getSTT]);

  const processTranscript = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isProcessingRef.current) return;

      isProcessingRef.current = true;
      setExpression("thinking");
      setStatus("Thinking...");
      setInterimText("");
      setError(null);

      try {
        conversationRef.current.push({ role: "user", content: trimmed });
        setDisplayMessages((prev) => [
          ...prev,
          { role: "user", content: trimmed },
        ]);

        const ollama = getOllama();
        setDisplayMessages((prev) => [...prev, { role: "assistant", content: "" }]);
        setExpression("thinking");
        setStatus("Thinking...");

        const reply = await ollama.chatStream(
          {
            messages: conversationRef.current,
            model: process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? undefined,
          },
          {
            onChunk: (delta) => {
              setDisplayMessages((prev) => {
                const next = [...prev];
                const last = next[next.length - 1];
                if (last?.role === "assistant")
                  next[next.length - 1] = { ...last, content: last.content + delta };
                return next;
              });
            },
          }
        );

        const replyTrimmed = (reply ?? "").trim();
        conversationRef.current.push({ role: "assistant", content: replyTrimmed });
        setDisplayMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant")
            next[next.length - 1] = { ...last, content: replyTrimmed };
          return next;
        });

        if (!replyTrimmed) {
          setStatus("No reply. Press Space to try again.");
          setExpression("idle");
          isProcessingRef.current = false;
          return;
        }

        setStatus("Loading speech...");
        const tts = getTTS();
        tts.setCallbacks({
          onStart: () => {
            setIsPlayingAudio(true);
            setStatus("Speaking...");
          },
          onEnd: () => {
            setIsPlayingAudio(false);
            setExpression("idle");
            setStatus("Press Space to start listening");
          },
        });
        await tts.speak(replyTrimmed);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setStatus("Error. Press Space to try again.");
        setExpression("idle");
        setIsPlayingAudio(false);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [getOllama, getTTS]
  );

  const startListening = useCallback(() => {
    if (isProcessingRef.current) return;

    const stt = getSTT();
    if (!stt.isSupported()) {
      setError("Speech recognition not supported in this browser.");
      return;
    }

    if (stt.isListening()) {
      stopListening();
      return;
    }

    setError(null);
    setInterimText("");
    finalTranscriptRef.current = "";
    setExpression("listening");
    setStatus("Listening... (Space to stop)");

    stt.setCallbacks({
      onResult: (text: string, isFinal: boolean) => {
        if (isFinal) {
          finalTranscriptRef.current = text;
          setInterimText("");
        } else {
          setInterimText(text);
        }
      },
      onError: (e: Error) => {
        setError(e.message);
        setStatus("Press Space to try again");
        setExpression("idle");
      },
      onStart: () => setExpression("listening"),
      onEnd: () => {
        const wasUserStop = userStoppedRef.current;
        userStoppedRef.current = false;
        if (wasUserStop) {
          const t = finalTranscriptRef.current.trim();
          if (t) {
            processTranscript(t);
            return;
          }
        }
        setExpression("idle");
        setStatus("Press Space to start listening");
      },
    });

    stt.startListening({ continuous: true, interimResults: true });
    isListeningRef.current = true;
    setIsListening(true);
  }, [getSTT, stopListening, processTranscript]);

  const startNewConversation = useCallback(() => {
    stopListening();
    conversationRef.current = [{ role: "system", content: OLLAMA_SYSTEM_PROMPT }];
    setDisplayMessages([]);
    setStatus("Press Space to start listening");
    setError(null);
    setInterimText("");
    setIsPlayingAudio(false);
  }, [stopListening]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (e.target instanceof HTMLElement && (e.target.closest("button") || e.target.closest("input") || e.target.closest("textarea"))) return;
      e.preventDefault();
      const stt = getSTT();
      if (stt.isListening()) {
        stopListening();
        return;
      }
      if (isProcessingRef.current) return;
      startListening();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [getSTT, startListening, stopListening]);

  return {
    expression,
    status,
    error,
    interimText,
    isListening,
    isPlayingAudio,
    displayMessages,
    startNewConversation,
  };
}
