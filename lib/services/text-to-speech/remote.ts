"use client";

import type {
  TextToSpeechService,
  TTSCallbacks,
  TTSOptions,
} from "./types";

const SYNTHESIZE_PATH = "/synthesize";
const MAX_CACHE_ENTRIES = 50;

/**
 * TTS service that calls a remote server: POST { text } → response body = WAV bytes.
 * Caches decoded AudioBuffers in memory by text so replay does not re-request.
 * Set NEXT_PUBLIC_TTS_SERVER_URL to the base URL of your TTS server (e.g. http://192.168.1.5:8000).
 * If unset, the app falls back to Web Speech TTS.
 */
export class RemoteTTSService implements TextToSpeechService {
  private baseUrl: string;
  private callbacks: TTSCallbacks = {};
  private abortController: AbortController | null = null;
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  /** Cache of trimmed text → decoded AudioBuffer for replay without re-fetching. */
  private cache = new Map<string, AudioBuffer>();

  constructor(baseUrl?: string) {
    const url =
      baseUrl ??
      (typeof window !== "undefined"
        ? process.env.NEXT_PUBLIC_TTS_SERVER_URL ?? ""
        : "");
    this.baseUrl = url.replace(/\/$/, "");
  }

  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      !!this.baseUrl &&
      typeof window.AudioContext !== "undefined"
    );
  }

  setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  async speak(text: string, _options: TTSOptions = {}): Promise<void> {
    if (!this.baseUrl) {
      throw new Error("TTS server URL not configured (NEXT_PUBLIC_TTS_SERVER_URL)");
    }

    const trimmed = text.trim();
    if (!trimmed) return;

    this.cancel();

    const ctx = this.audioContext ?? new AudioContext();
    this.audioContext = ctx;

    let buffer: AudioBuffer | undefined = this.cache.get(trimmed);

    if (!buffer) {
      this.abortController = new AbortController();
      const signal = this.abortController.signal;

      const url = `${this.baseUrl}${SYNTHESIZE_PATH}`;
      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
          signal,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        throw err;
      }

      if (!res.ok) {
        const contentType = res.headers.get("Content-Type") ?? "";
        let message = `TTS server error ${res.status}`;
        if (contentType.includes("application/json")) {
          try {
            const body = (await res.json()) as { error?: string };
            if (body.error) message = body.error;
          } catch {
            // use default message
          }
        } else {
          const textBody = await res.text();
          if (textBody) message = textBody;
        }
        throw new Error(message);
      }

      const arrayBuffer = await res.arrayBuffer();
      if (signal.aborted) return;

      try {
        buffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
      } catch (e) {
        throw new Error(
          `TTS server returned invalid audio: ${e instanceof Error ? e.message : String(e)}`
        );
      }

      if (signal.aborted) return;

      this.cache.set(trimmed, buffer);
      if (this.cache.size > MAX_CACHE_ENTRIES) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) this.cache.delete(firstKey);
      }
      this.abortController = null;
    }

    return new Promise((resolve) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      this.currentSource = source;

      source.onended = () => {
        this.currentSource = null;
        this.callbacks.onEnd?.();
        resolve();
      };

      source.start(0);
      this.callbacks.onStart?.();
    });
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // already stopped
      }
      this.currentSource = null;
    }
  }
}
