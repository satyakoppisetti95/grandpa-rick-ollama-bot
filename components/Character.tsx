"use client";

import React, { useEffect, useRef, useState } from "react";

export type CharacterExpression = "idle" | "listening" | "thinking" | "speaking";

interface CharacterProps {
  expression: CharacterExpression;
  mouthOpen?: number;
  animateMouthWhenSpeaking?: boolean;
  className?: string;
}

// Sprite sheet layout (see docs/SPRITES.md)
const SPRITE_FRAME_WIDTH = 256;
const SPRITE_FRAME_HEIGHT = 256;
const SPRITE_COLS = 4;
const SPRITE_ROWS = 2;
const MOUTH_FRAMES = 3;
const MOUTH_FRAME_SIZE = 64;
const DISPLAY_SIZE = 380;

// ————— MOUTH SPRITE SETTINGS (adjust here) —————
/** Vertical position: 0 = top of character, 1 = bottom. Increase to move mouth DOWN (e.g. 0.9, 0.95 if still on top). */
const MOUTH_TOP_RATIO = 0.68;
/** Horizontal position: 0.5 = centered. Slightly less = left, more = right. */
const MOUTH_LEFT_RATIO = 0.52;
/** Size of the mouth overlay in pixels. */
const MOUTH_DISPLAY_SIZE = 120;
// ———————————————————————————————————————————————

const BLINK_INTERVAL_MS = 2800;
const BLINK_DURATION_MS = 100;

const EXPRESSION_TO_COL: Record<CharacterExpression, number> = {
  idle: 0,
  listening: 1,
  thinking: 2,
  speaking: 3,
};

export function Character({
  expression,
  mouthOpen = 0,
  animateMouthWhenSpeaking = true,
  className = "",
}: CharacterProps) {
  const [blink, setBlink] = useState(false);
  const [syntheticMouth, setSyntheticMouth] = useState(0);
  const [spriteError, setSpriteError] = useState(false);
  const blinkRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const scheduleBlink = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), BLINK_DURATION_MS);
    };
    blinkRef.current = setInterval(scheduleBlink, BLINK_INTERVAL_MS + Math.random() * 1200);
    return () => {
      if (blinkRef.current) clearInterval(blinkRef.current);
    };
  }, []);

  useEffect(() => {
    if (expression !== "speaking" || !animateMouthWhenSpeaking) {
      setSyntheticMouth(0);
      return;
    }
    startTimeRef.current = performance.now();
    let running = true;
    const tick = () => {
      if (!running) return;
      const t = (performance.now() - startTimeRef.current) / 180;
      const wave = Math.sin(t) * 0.5 + 0.5;
      setSyntheticMouth(wave);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [expression, animateMouthWhenSpeaking]);

  const mouthAmount =
    expression === "speaking"
      ? animateMouthWhenSpeaking
        ? syntheticMouth
        : Math.min(1, Math.max(0, mouthOpen))
      : 0;

  const col = EXPRESSION_TO_COL[expression];
  const row = blink ? 1 : 0;
  const scale = DISPLAY_SIZE / SPRITE_FRAME_WIDTH;
  const sheetDisplayWidth = SPRITE_COLS * SPRITE_FRAME_WIDTH * scale;
  const sheetDisplayHeight = SPRITE_ROWS * SPRITE_FRAME_HEIGHT * scale;
  const frameLeft = col * DISPLAY_SIZE;
  const frameTop = row * DISPLAY_SIZE;

  const mouthFrameIndex =
    mouthAmount < 0.02 ? 0 : mouthAmount < 0.5 ? 1 : 2;
  const mouthSheetDisplayWidth = MOUTH_FRAMES * MOUTH_DISPLAY_SIZE;

  return (
    <div className={className} aria-hidden style={{ width: DISPLAY_SIZE, minWidth: DISPLAY_SIZE, maxWidth: DISPLAY_SIZE }}>
      {spriteError ? (
        <div
          className="flex flex-col items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white/60 text-sm text-center min-h-[380px] p-4"
          role="img"
          aria-label="Character placeholder"
        >
          <p className="font-medium">Character sprites not found</p>
          <p className="mt-2 text-xs">
            Add <code className="bg-white/10 px-1 rounded">character-sheet.png</code> and{" "}
            <code className="bg-white/10 px-1 rounded">mouth-sheet.png</code> to{" "}
            <code className="bg-white/10 px-1 rounded">public/</code>
          </p>
          <p className="mt-2 text-xs">
            See <code className="bg-white/10 px-1 rounded">docs/SPRITES.md</code> and{" "}
            <code className="bg-white/10 px-1 rounded">docs/PROMPT_FOR_SPRITES.md</code>
          </p>
        </div>
      ) : (
        <div
          className="overflow-hidden flex-shrink-0"
          style={{
            position: "relative",
            width: DISPLAY_SIZE,
            height: DISPLAY_SIZE,
            minWidth: DISPLAY_SIZE,
            minHeight: DISPLAY_SIZE,
            maxWidth: DISPLAY_SIZE,
            maxHeight: DISPLAY_SIZE,
            filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))",
            backgroundImage: "url(/character-sheet.png)",
            backgroundRepeat: "no-repeat",
            backgroundSize: `${sheetDisplayWidth}px ${sheetDisplayHeight}px`,
            backgroundPosition: `${-frameLeft}px ${-frameTop}px`,
          }}
        >
          <img
            src="/character-sheet.png"
            alt=""
            style={{ position: "absolute", width: 0, height: 0, opacity: 0, pointerEvents: "none" }}
            onError={() => setSpriteError(true)}
            aria-hidden
          />
          {expression === "speaking" && (
            <div
              style={{
                position: "absolute",
                left: MOUTH_LEFT_RATIO * DISPLAY_SIZE - MOUTH_DISPLAY_SIZE / 2,
                top: MOUTH_TOP_RATIO * DISPLAY_SIZE - MOUTH_DISPLAY_SIZE / 2,
                width: MOUTH_DISPLAY_SIZE,
                height: MOUTH_DISPLAY_SIZE,
                pointerEvents: "none",
                overflow: "hidden",
                backgroundImage: "url(/mouth-sheet.png)",
                backgroundRepeat: "no-repeat",
                backgroundSize: `${mouthSheetDisplayWidth}px ${MOUTH_DISPLAY_SIZE}px`,
                backgroundPosition: `${-mouthFrameIndex * MOUTH_DISPLAY_SIZE}px 0`,
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
