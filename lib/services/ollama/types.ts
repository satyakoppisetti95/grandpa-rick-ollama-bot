/**
 * LLM service interface for chat/completion.
 * Default implementation talks to Ollama on the local network.
 * Replace with another implementation for a different model backend.
 */
export interface OllamaService {
  generate(params: GenerateParams): Promise<string>;
  /** Chat with full message history (keeps conversation context). */
  chat(params: ChatParams): Promise<string>;
  /** Stream chat response; callbacks.onChunk(delta) for real-time UI. */
  chatStream(params: ChatParams, callbacks: ChatStreamCallbacks): Promise<string>;
  isAvailable(baseUrl?: string): Promise<boolean>;
}

export interface GenerateParams {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatParams {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ChatStreamCallbacks {
  onChunk?: (delta: string) => void;
}
