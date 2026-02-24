# Prompt for generating character sprites

Use this (or adapt it) in **Gemini** (or any image model) to generate the two sprite sheets. You can paste the whole thing or copy the sections you need.

---

## Prompt 1: Character sprite sheet

```
Create a single PNG sprite sheet for a 2D character for a web app. No background — use full transparency outside the character.

IMAGE SPECS:
- One image, 1024 pixels wide × 512 pixels tall.
- Divide it into a grid of 4 columns and 2 rows (8 cells total).
- Each cell is 256×256 pixels. Draw one pose per cell.

GRID LAYOUT (left to right, top to bottom):
Row 1 (top row) — character with EYES OPEN:
  Cell 1: Idle — neutral, relaxed face, mouth closed, looking at camera.
  Cell 2: Listening — slightly attentive (eyes a bit wider or alert), mouth closed.
  Cell 3: Thinking — pondering (e.g. eyes looking up or to the side, slight frown), mouth closed.
  Cell 4: Speaking — same pose as idle, mouth closed (we will overlay mouth animation separately).

Row 2 (bottom row) — SAME four poses but with EYES CLOSED (blink):
  Cell 5: Idle, eyes closed.
  Cell 6: Listening, eyes closed.
  Cell 7: Thinking, eyes closed.
  Cell 8: Speaking, eyes closed.

CHARACTER:
- A grumpy old man: pale skin, thick dark unibrow, small tired eyes, large nose, thin downturned mouth.
- Cyan/light blue spiky hair on top and back (receding hairline).
- Dark blue lab coat collar, orange/red shirt or tie visible below.
- Head and shoulders only; character centered in each cell.
- Same body position and scale in every cell — only expression (and eyes open/closed) changes.
- Flat 2D style, clear outlines, suitable for a cartoon chat app.

Export as PNG with transparency. No borders between cells; the grid is logical only.
```

---

## Prompt 2: Mouth sprite sheet

```
Create a small PNG sprite sheet of only a MOUTH for 2D lip-sync overlay. No face, no head — just the mouth. Full transparency everywhere else.

IMAGE SPECS:
- One image, 192 pixels wide × 64 pixels tall.
- Divide into 3 equal horizontal cells, 64×64 pixels each.

CELLS (left to right):
  Cell 1: Mouth CLOSED — thin horizontal line or very small closed mouth (neutral/grumpy style).
  Cell 2: Mouth HALF-OPEN — oval or slightly open shape.
  Cell 3: Mouth OPEN — clearly open “O” shape for speech.

STYLE:
- Same art style as a grumpy old man character (simple, 2D, dark line or fill).
- Mouth centered in each 64×64 cell.
- Color: dark brown or dark gray (#5a4a3a or similar).

Export as PNG with transparency.
```

---

## If the model outputs separate images

If you get **8 separate character images** instead of one sheet:

1. Arrange them in an image editor (e.g. Photoshop, GIMP, Figma) in this order:
   - Row 1: idle, listening, thinking, speaking (eyes open)
   - Row 2: same four with eyes closed
   - Each image 256×256; canvas 1024×512.
2. Export as one PNG: `character-sheet.png`.

For the mouth, if you get 3 images:
- Put them in one row: closed, half-open, open. Canvas 192×64. Export as `mouth-sheet.png`.

---

## After generating

1. Save the character sheet as `public/character-sheet.png`.
2. Save the mouth sheet as `public/mouth-sheet.png`.
3. Restart or refresh the app; the Character component will use these sprites automatically.
