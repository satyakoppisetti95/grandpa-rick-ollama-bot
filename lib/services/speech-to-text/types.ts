/**
 * Speech-to-Text service interface.
 * Implement this to swap in different providers (Web Speech API, Whisper, etc.).
 */
export interface SpeechToTextService {
  isSupported(): boolean;
  startListening(options?: STTOptions): void;
  stopListening(): void;
  isListening(): boolean;
  setCallbacks(callbacks: STTCallbacks): void;
}

export interface STTCallbacks {
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface STTOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}
