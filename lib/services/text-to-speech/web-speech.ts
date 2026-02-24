"use client";

import type {
  TextToSpeechService,
  TTSCallbacks,
  TTSOptions,
} from "./types";

/**
 * Browser Web Speech API (SpeechSynthesis) implementation.
 * Free, no API key. Replace with another implementation for better voices or audio access (e.g. for volume-based lip-sync).
 */
export class WebSpeechTTSService implements TextToSpeechService {
  private callbacks: TTSCallbacks = {};
  private utterance: SpeechSynthesisUtterance | null = null;
  private synthesis: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis;
    }
  }

  isSupported(): boolean {
    return typeof window !== "undefined" && !!window.speechSynthesis;
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  speak(text: string, options: TTSOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error("Speech synthesis not supported"));
        return;
      }

      this.cancel();

      const u = new SpeechSynthesisUtterance(text);
      u.rate = options.rate ?? 1;
      u.pitch = options.pitch ?? 1;
      u.volume = options.volume ?? 1;
      if (options.voice) {
        const voices = this.synthesis.getVoices();
        const voice = voices.find((v) => v.name === options.voice);
        if (voice) u.voice = voice;
      }

      u.onstart = () => this.callbacks.onStart?.();
      u.onend = () => {
        this.callbacks.onEnd?.();
        resolve();
      };
      u.onerror = (e) => reject(new Error(e.error));
      u.onboundary = (e) => {
        if (e.name === "word" && e.charIndex !== undefined && e.charLength !== undefined) {
          const word = text.slice(e.charIndex, e.charIndex + e.charLength);
          this.callbacks.onBoundary?.(word, 0, 0);
        }
      };

      this.utterance = u;
      this.synthesis.speak(u);
    });
  }

  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    this.utterance = null;
  }
}
