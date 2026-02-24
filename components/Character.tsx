"use client";

import React, { useEffect, useRef, useState } from "react";

export type CharacterExpression = "idle" | "listening" | "thinking" | "speaking";

interface CharacterProps {
  expression: CharacterExpression;
  mouthOpen?: number;
  animateMouthWhenSpeaking?: boolean;
  className?: string;
}

const BLINK_INTERVAL_MS = 2800;
const BLINK_DURATION_MS = 100;

export function Character({
  expression,
  mouthOpen = 0,
  animateMouthWhenSpeaking = true,
  className = "",
}: CharacterProps) {
  const [blink, setBlink] = useState(false);
  const [syntheticMouth, setSyntheticMouth] = useState(0);
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
      : expression === "listening"
        ? 0.12
        : expression === "thinking"
          ? 0.04
          : 0;

  const eyeOpen = blink ? 0.06 : expression === "thinking" ? 0.5 : 0.65;

  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 200 220"
        className="w-full h-full max-w-[280px] max-h-[320px] mx-auto"
        style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.35))" }}
      >
        <defs>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2d4c8" />
            <stop offset="50%" stopColor="#d0beae" />
            <stop offset="100%" stopColor="#b8a090" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#5eb8d4" />
            <stop offset="100%" stopColor="#7dd4ed" />
          </linearGradient>
          <linearGradient id="coatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3d4a6e" />
            <stop offset="100%" stopColor="#2a3250" />
          </linearGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.2" />
          </filter>
        </defs>

        {/* Lab coat collar (behind head) */}
        <path
          d="M 55 165 L 55 218 L 100 200 L 145 218 L 145 165 Q 100 155 55 165"
          fill="url(#coatGrad)"
          stroke="#1e2438"
          strokeWidth="1.5"
        />
        <path
          d="M 98 168 L 98 200 L 102 200 L 102 168"
          fill="#252d44"
        />
        {/* Shirt / inner collar */}
        <path
          d="M 60 172 L 100 162 L 140 172 L 140 200 L 60 200 Z"
          fill="#c45c3e"
          stroke="#a04a30"
          strokeWidth="1"
        />

        {/* Ears */}
        <ellipse cx="40" cy="108" rx="11" ry="16" fill="url(#skinGrad)" transform="rotate(-15 40 108)" />
        <ellipse cx="160" cy="108" rx="11" ry="16" fill="url(#skinGrad)" transform="rotate(15 160 108)" />

        {/* Back hair - drawn BEFORE head so it sits behind, never on face */}
        <path
          d="M 50 85 L 48 120 L 52 150 Q 100 156 148 150 L 152 120 L 150 85 Q 120 65 100 62 Q 80 65 50 85 Z"
          fill="url(#hairGrad)"
          stroke="#4a9fb8"
          strokeWidth="1"
        />

        {/* Head - full face in skin (nothing blue on face) */}
        <ellipse cx="100" cy="112" rx="60" ry="70" fill="url(#skinGrad)" filter="url(#softShadow)" />

        {/* Top hair: small dome only - receding hairline, all face skin */}
        <path
          d="M 74 56 Q 90 42 100 38 Q 110 42 126 56 Q 118 66 100 68 Q 82 66 74 56 Z"
          fill="url(#hairGrad)"
          stroke="#4a9fb8"
          strokeWidth="1"
        />
        <path d="M 78 50 L 62 28 L 76 48" fill="#6ec8e3" stroke="#4a9fb8" strokeWidth="0.5" />
        <path d="M 100 36 L 100 14" stroke="#7dd4ed" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M 122 50 L 138 28 L 124 48" fill="#6ec8e3" stroke="#4a9fb8" strokeWidth="0.5" />

        {/* Unibrow - thick dark bar, angled down (grumpy) */}
        <path
          d="M 56 84 L 78 80 L 100 81 L 122 80 L 144 84"
          fill="none"
          stroke="#3a3a3a"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Eyes - small, tired, half-lidded */}
        <g>
          <ellipse cx="76" cy="100" rx="11" ry={11 * eyeOpen} fill="#1a1a1a" />
          <ellipse cx="124" cy="100" rx="11" ry={11 * eyeOpen} fill="#1a1a1a" />
          <ellipse cx="77" cy={100 - 3 * eyeOpen} rx="3" ry="2" fill="#fff" opacity="0.8" />
          <ellipse cx="125" cy={100 - 3 * eyeOpen} rx="3" ry="2" fill="#fff" opacity="0.8" />
        </g>
        {/* Droopy lid lines */}
        <path d="M 66 97 L 86 96" stroke="#b8a090" strokeWidth="1.5" fill="none" />
        <path d="M 114 96 L 134 97" stroke="#b8a090" strokeWidth="1.5" fill="none" />

        {/* Nose - big and prominent */}
        <path
          d="M 100 104 L 106 130 L 103 138 L 97 130 Z"
          fill="#c8b4a0"
          stroke="#a89888"
          strokeWidth="1"
        />

        {/* Mouth: thin downturned line (grumpy) or open when speaking */}
        <g style={{ transform: "translate(100px, 144px)", transformOrigin: "0 0" }}>
          {mouthAmount < 0.02 ? (
            <path
              d="M -14 4 L 0 2 L 14 4"
              fill="none"
              stroke="#5a4a3a"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          ) : (
            <ellipse
              cx="0"
              cy={mouthAmount * 5}
              rx={12 + mouthAmount * 4}
              ry={mouthAmount * 10}
              fill="#5a4a3a"
            />
          )}
        </g>
      </svg>
    </div>
  );
}
