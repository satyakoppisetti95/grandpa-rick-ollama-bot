"use client";

import type {
  SpeechToTextService,
  STTCallbacks,
  STTOptions,
} from "./types";

/**
 * Browser Web Speech API (SpeechRecognition) implementation.
 * Free, no API key. Replace with lib/services/speech-to-text/whisper.ts (or similar) for a different provider.
 */
export class WebSpeechSTTService implements SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private callbacks: STTCallbacks = {};
  private listening = false;

  isSupported(): boolean {
    if (typeof window === "undefined") return false;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof globalThis.SpeechRecognition })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof globalThis.SpeechRecognition })
        .webkitSpeechRecognition;
    return !!SpeechRecognition;
  }

  setCallbacks(callbacks: STTCallbacks): void {
    this.callbacks = callbacks;
  }

  startListening(options: STTOptions = {}): void {
    if (this.listening) return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: typeof globalThis.SpeechRecognition })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof globalThis.SpeechRecognition })
        .webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.callbacks.onError?.(new Error("Speech recognition not supported"));
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.lang = options.language ?? "en-US";

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;
      this.callbacks.onResult?.(transcript, isFinal);
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "aborted") return;
      this.callbacks.onError?.(new Error(event.error));
    };

    this.recognition.onstart = () => {
      this.listening = true;
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      this.listening = false;
      this.callbacks.onEnd?.();
    };

    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition && this.listening) {
      this.recognition.stop();
    }
    this.listening = false;
  }

  isListening(): boolean {
    return this.listening;
  }
}
