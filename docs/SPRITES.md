# Sprite-based character

The character is driven by **two sprite sheets**. Put your generated images in `public/` and the app will use them.

---

## 1. Character sprite sheet (`public/character-sheet.png`)

One image containing all expression frames in a **grid**.

### Layout

- **Grid:** 4 columns × 2 rows = 8 frames
- **Frame size:** 256×256 px (each cell)
- **Total image size:** 1024×512 px
- **Format:** PNG with **transparent background**

### Frame order (left to right, top to bottom)

| Col | Row 0 (eyes open) | Row 1 (eyes closed / blink) |
|-----|-------------------|-----------------------------|
| 0   | **Idle**          | Idle (blink)                |
| 1   | **Listening**     | Listening (blink)           |
| 2   | **Thinking**      | Thinking (blink)            |
| 3   | **Speaking**      | Speaking (blink)            |

- **Row 0:** Normal eyes open. Use for: idle, listening, thinking, speaking (mouth can be closed in the art; mouth animation is handled by the second sheet).
- **Row 1:** Same poses but **eyes closed** (for blink). Keep body/pose identical to row 0 so only the eyes change.

### Content per frame

- **Idle:** Neutral, relaxed face. Mouth closed.
- **Listening:** Slightly attentive (e.g. eyes a bit wider or slight lean). Mouth closed.
- **Thinking:** Pondering look (e.g. eyes up or to the side, slight frown). Mouth closed.
- **Speaking:** Same as idle or slight “talking” pose. **Mouth closed** in the art; the app overlays the mouth sprite when speaking.

Character should be **centered** in each 256×256 cell and roughly the **same scale** in every frame so switching frames doesn’t jump.

---

## 2. Mouth sprite sheet (`public/mouth-sheet.png`)

Used only when the character is **speaking**. The app overlays this over the character and cycles frames for lip-sync.

### Layout

- **Grid:** 3 columns × 1 row = 3 frames
- **Frame size:** 64×64 px (each cell)
- **Total image size:** 192×64 px
- **Format:** PNG with **transparent background**

### Frame order (left to right)

| Col | Frame   | Description        |
|-----|---------|--------------------|
| 0   | Closed  | Thin line or small closed mouth |
| 1   | Half    | Half-open mouth    |
| 2   | Open    | Open mouth (e.g. “O”) |

The mouth should be **centered** in each 64×64 cell. No face or head — only the mouth shape, so it can be overlaid on the character at the right position.

---

## File names and location

```
public/
  character-sheet.png   (1024×512, 4×2 grid, 256×256 per frame)
  mouth-sheet.png       (192×64, 3×1 grid, 64×64 per frame)
```

If these files are missing, the app falls back to a simple placeholder (or the previous SVG/image character if you leave it in place).

---

## Optional: different dimensions

If your art uses other sizes, you can change the config in the Character component:

- `SPRITE_FRAME_WIDTH`, `SPRITE_FRAME_HEIGHT` (character)
- `SPRITE_COLS`, `SPRITE_ROWS`
- `MOUTH_FRAME_WIDTH`, `MOUTH_FRAME_HEIGHT`, `MOUTH_FRAMES`

The grid layout (column order: idle, listening, thinking, speaking; row 0 = eyes open, row 1 = blink) should stay the same so the code’s frame index stays correct.
