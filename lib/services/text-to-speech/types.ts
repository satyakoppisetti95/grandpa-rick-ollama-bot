/**
 * Text-to-Speech service interface.
 * Implement this to swap in different providers (Web Speech, ElevenLabs, local TTS, etc.).
 */
export interface TextToSpeechService {
  isSupported(): boolean;
  speak(text: string, options?: TTSOptions): Promise<void>;
  cancel(): void;
  setCallbacks(callbacks: TTSCallbacks): void;
}

export interface TTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  /** Called at word boundaries when supported (e.g. Web Speech). Use for lip-sync. */
  onBoundary?: (word: string, startTime: number, endTime: number) => void;
}

export interface TTSOptions {
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}
