"use client";

import type {
  ChatParams,
  ChatStreamCallbacks,
  GenerateParams,
  OllamaService,
} from "./types";

const DEFAULT_BASE_URL = "http://localhost:11434";
const DEFAULT_MODEL = "llama3.2";

/**
 * Ollama REST API client.
 * Set NEXT_PUBLIC_OLLAMA_BASE_URL to point to your Ollama instance (e.g. http://192.168.1.5:11434).
 */
export class OllamaClient implements OllamaService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      (typeof window !== "undefined"
        ? (process.env.NEXT_PUBLIC_OLLAMA_BASE_URL ?? DEFAULT_BASE_URL)
        : baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  }

  async isAvailable(baseUrl?: string): Promise<boolean> {
    const url = baseUrl ?? this.baseUrl;
    try {
      const res = await fetch(`${url}/api/tags`, { method: "GET" });
      return res.ok;
    } catch {
      return false;
    }
  }

  async generate(params: GenerateParams): Promise<string> {
    const { prompt, systemPrompt, model = DEFAULT_MODEL, maxTokens, temperature } = params;
    const url = `${this.baseUrl}/api/generate`;
    const body: Record<string, unknown> = {
      model,
      prompt,
      stream: false,
    };
    if (systemPrompt) body.system = systemPrompt;
    if (maxTokens != null) body.options = { ...(body.options as object), num_predict: maxTokens };
    if (temperature != null) body.options = { ...(body.options as object), temperature };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { response?: string };
    return data.response ?? "";
  }

  async chat(params: ChatParams): Promise<string> {
    const { messages, model = DEFAULT_MODEL, maxTokens, temperature } = params;
    const url = `${this.baseUrl}/api/chat`;
    const body: Record<string, unknown> = {
      model,
      messages,
      stream: false,
    };
    if (maxTokens != null) body.options = { ...(body.options as object), num_predict: maxTokens };
    if (temperature != null) body.options = { ...(body.options as object), temperature };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama error ${res.status}: ${text}`);
    }

    const data = (await res.json()) as { message?: { content?: string } };
    return data.message?.content ?? "";
  }

  async chatStream(
    params: ChatParams,
    callbacks: ChatStreamCallbacks
  ): Promise<string> {
    const { messages, model = DEFAULT_MODEL, maxTokens, temperature } = params;
    const url = `${this.baseUrl}/api/chat`;
    const body: Record<string, unknown> = {
      model,
      messages,
      stream: true,
    };
    if (maxTokens != null)
      body.options = { ...(body.options as object), num_predict: maxTokens };
    if (temperature != null)
      body.options = { ...(body.options as object), temperature };

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Ollama error ${res.status}: ${text}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();
    let fullContent = "";
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const data = JSON.parse(trimmed) as {
              message?: { content?: string };
              done?: boolean;
            };
            const content = data.message?.content;
            if (typeof content === "string" && content) {
              fullContent += content;
              callbacks.onChunk?.(content);
            }
          } catch {
            // ignore malformed JSON lines
          }
        }
      }
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer.trim()) as {
            message?: { content?: string };
          };
          const content = data.message?.content;
          if (typeof content === "string" && content) {
            fullContent += content;
            callbacks.onChunk?.(content);
          }
        } catch {
          // ignore
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }
}
