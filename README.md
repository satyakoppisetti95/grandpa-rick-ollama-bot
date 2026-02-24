# Ollama Bot – Voice character

A single-page Next.js app: talk to a character with your voice. Press **Space** to start listening, press **Space** again to stop. Your speech is sent to Ollama on your local network; the reply is spoken back with text-to-speech. The character has expressions and mouth animation synced to speech.

Runs entirely in the browser. Uses **free** built-in browser APIs for speech-to-text and text-to-speech (no API keys). Ollama runs locally.

---

## Setup

### 1. Node

- **Node.js** 18+  
- Install from [nodejs.org](https://nodejs.org/) or via your package manager.

### 2. Ollama (local LLM)

- Install: [ollama.com](https://ollama.com) (macOS, Windows, Linux).
- Start Ollama (usually runs in the background; on first run it may open a terminal or app).
- Pull a model, e.g.:
  ```bash
  ollama pull llama3.2
  ```
- By default the app uses `llama3.2`. To use another model, set `NEXT_PUBLIC_OLLAMA_MODEL` (see **Environment** below).
- If the app and Ollama are on the same machine, no extra config is needed. If Ollama is on another machine, set `NEXT_PUBLIC_OLLAMA_BASE_URL` to that machine’s URL (see **Environment**).

### 3. Project

```bash
cd /path/to/Ollama-bot
npm install
cp .env.example .env   # optional; edit .env if you need custom Ollama URL/model
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Allow microphone when prompted. Press **Space** to start/stop listening.

---

## Environment

| Variable | Where to get it | Required |
|----------|-----------------|----------|
| `NEXT_PUBLIC_OLLAMA_BASE_URL` | Your Ollama server URL. Default: `http://localhost:11434`. If Ollama is on another machine (e.g. `192.168.1.5`), use `http://192.168.1.5:11434`. | No |
| `NEXT_PUBLIC_OLLAMA_MODEL` | Model name from Ollama (e.g. `llama3.2`, `gurubot/self-after-dark`). Must be pulled with `ollama pull <name>`. Default: `llama3.2`. | No |
| `NEXT_PUBLIC_OLLAMA_SYSTEM_PROMPT` | System prompt that defines the character. Default: *"The assistant is a 38 year old bitter man who rages at the world."* (works well with [gurubot/self-after-dark](https://ollama.com/gurubot/self-after-dark)). | No |

Create a `.env` or `.env.local` in the project root and add any of these if you need to override defaults. Restart `npm run dev` after changing env.

**Using the “bitter man” character (self-after-dark):** Pull the model with `ollama pull gurubot/self-after-dark`, then set `NEXT_PUBLIC_OLLAMA_MODEL=gurubot/self-after-dark` in `.env`. The default system prompt is already set to the recommended style for that model.

---

## Where to get what

| Feature | What’s used | Free? | How to replace later |
|--------|-------------|--------|------------------------|
| **Speech-to-text** | Browser Web Speech API (`SpeechRecognition`) | Yes | Implement `lib/services/speech-to-text/types.ts` (e.g. Whisper, Google Cloud STT). |
| **LLM** | Ollama on your machine/network | Yes (local) | Implement `lib/services/ollama/types.ts` or change `OllamaClient` base URL; or swap to another backend that implements the same interface. |
| **Text-to-speech** | Browser Web Speech API (`SpeechSynthesis`) | Yes | Implement `lib/services/text-to-speech/types.ts` (e.g. ElevenLabs, Play.ht, or local TTS). |
| **Character / lip-sync** | SVG character in `components/Character.tsx`; mouth animated with a time-based wave while speaking (no audio analysis). | Yes | For volume-based lip-sync, add a TTS implementation that exposes an audio stream and drive `mouthOpen` from volume (e.g. Web Audio `AnalyserNode`). |

---

## Replacing services

The app uses small facades so you can swap providers without changing the rest of the app:

- **STT:** Implement `SpeechToTextService` in `lib/services/speech-to-text/` and use it where `WebSpeechSTTService` is created (e.g. in `hooks/useVoiceChat.ts`).
- **LLM:** Implement `OllamaService` in `lib/services/ollama/` (or point `OllamaClient` at a different URL).
- **TTS:** Implement `TextToSpeechService` in `lib/services/text-to-speech/` and use it in the voice chat hook. A TTS that returns or plays audio through the Web Audio API can be used to drive real-time mouth animation from volume.

---

## Build for production

```bash
npm run build
npm start
```

Runs on port 3000 by default. For microphone and optional custom Ollama URL, use HTTPS in production if required by your browser (e.g. many browsers require HTTPS for `getUserMedia` except on localhost).
