# Editable PPTX Export: HTML Hard Constraints + Sizing Decisions + Common Errors

This document covers the path of **using `scripts/html2pptx.js` + `pptxgenjs` to translate HTML element-by-element into truly editable PowerPoint text frames** — also the only path supported by `export_deck_pptx.mjs`.

> **Core prerequisite**: to go down this path, the HTML must be written to the 4 constraints below **from the very first line**. **Not "write it then convert"** — retrofitting triggers 2-3 hours of rework (verified in the 2026-04-20 options-roundtable project).
>
> If your scenario prioritizes visual freedom (animation / web component / CSS gradients / complex SVG), take the PDF path instead (`export_deck_pdf.mjs` / `export_deck_stage_pdf.mjs`). **Do not** expect pptx export to give you both visual fidelity and editability — that's a physical constraint of the PPTX file format itself (see the closing section "Why the 4 Constraints Aren't Bugs but Physical Constraints").

---

## Canvas Size: Use 960×540pt (LAYOUT_WIDE)

PPTX's unit is **inch** (physical size), not px. Decision principle: the body's computedStyle dimensions must **match the presentation layout's inch dimensions** (±0.1″, enforced by `html2pptx.js`'s `validateDimensions`).

### Comparison of the 3 candidate sizes

| HTML body | Physical size | Matching PPT layout | When to choose |
|---|---|---|---|
| **`960pt × 540pt`** | **13.333″ × 7.5″** | **pptxgenjs `LAYOUT_WIDE`** | ✅ **Default recommendation** (the modern PowerPoint 16:9 standard) |
| `720pt × 405pt` | 10″ × 5.625″ | custom | Only when the user specifies an "old PowerPoint Widescreen" template |
| `1920px × 1080px` | 20″ × 11.25″ | custom | ❌ Non-standard size; fonts look unusually small once projected |

**Do not think of the HTML size as resolution.** PPTX is a vector document — the body size determines **physical size**, not clarity. An oversized body (20″×11.25″) does not make text sharper — it just makes pt font sizes smaller relative to the canvas, and they look worse when projected/printed.

### Three equivalent ways to write the body

```css
body { width: 960pt;  height: 540pt; }    /* clearest, recommended */
body { width: 1280px; height: 720px; }    /* equivalent, px habit */
body { width: 13.333in; height: 7.5in; }  /* equivalent, inch intuition */
```

Matching pptxgenjs code:

```js
const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch, no customization needed
```

---

## The 4 Hard Constraints (violations error out immediately)

`html2pptx.js` translates the HTML DOM element-by-element into PowerPoint objects. PowerPoint's format constraints projected onto HTML = the 4 rules below.

### Rule 1: No raw text inside DIVs — wrap with `<p>` or `<h1>`-`<h6>`

```html
<!-- ❌ Wrong: text directly in a div -->
<div class="title">Q3 revenue up 23%</div>

<!-- ✅ Right: text inside <p> or <h1>-<h6> -->
<div class="title"><h1>Q3 revenue up 23%</h1></div>
<div class="body"><p>New users are the main driver</p></div>
```

**Why**: PowerPoint text must live inside a text frame, and text frames correspond to HTML paragraph-level elements (p/h*/li). A bare `<div>` has no matching text container in PPTX.

**You also cannot use `<span>` to carry the main text** — span is inline, it can't independently align as a text frame. Span can only **sit inside a p/h\*** for local styling (bold, color change).

### Rule 2: No CSS gradients — solid colors only

```css
/* ❌ Wrong */
background: linear-gradient(to right, #FF6B6B, #4ECDC4);

/* ✅ Right: solid color */
background: #FF6B6B;

/* ✅ If you really need multi-color stripes, use flex children each in a solid color */
.stripe-bar { display: flex; }
.stripe-bar div { flex: 1; }
.red   { background: #FF6B6B; }
.teal  { background: #4ECDC4; }
```

**Why**: PowerPoint's shape fill supports only solid / gradient-fill, but pptxgenjs's `fill: { color: ... }` maps only to solid. Going through PowerPoint's native gradient requires a different structure that the current tool chain doesn't support.

### Rule 3: Background/border/shadow only on DIV, not on text tags

```html
<!-- ❌ Wrong: <p> has background -->
<p style="background: #FFD700; border-radius: 4px;">Highlight</p>

<!-- ✅ Right: outer div carries background/border, <p> only carries text -->
<div style="background: #FFD700; border-radius: 4px; padding: 8pt 12pt;">
  <p>Highlight</p>
</div>
```

**Why**: in PowerPoint, shapes (boxes / rounded rectangles) and text frames are two separate objects. HTML's `<p>` translates only into a text frame; background/border/shadow belong to the shape — they must be written on the **div that wraps the text**.

### Rule 4: DIV cannot use `background-image` — use an `<img>` tag

```html
<!-- ❌ Wrong -->
<div style="background-image: url('chart.png')"></div>

<!-- ✅ Right -->
<img src="chart.png" style="position: absolute; left: 50%; top: 20%; width: 300pt; height: 200pt;" />
```

**Why**: `html2pptx.js` only extracts image paths from `<img>` elements — it does not parse the URL in a CSS `background-image`.

---

## Merging Text Frames (`data-pptx-merge`)

**Default behavior**: every `<p>`/`<h1>`-`<h6>` in HTML becomes an **independent text frame** in PPTX. Three `<p>` inside a card → 3 stacked text frames in PPT; you can't add a new paragraph with a single return, you have to edit font size / alignment one by one.

**Solution**: add `data-pptx-merge="true"` to the outer div, and all the `<p>/<h*>` inside the container will merge into **one editable text frame**, with paragraph separators between segments — in PPT you edit segment-by-segment continuously.

```html
<!-- ✅ Merged form: all 4 paragraphs live in a single text frame -->
<div class="card" data-pptx-merge="true"
     style="position: absolute; top: 60pt; left: 60pt; width: 420pt;
            background: #1A4A8A; border-radius: 8pt; padding: 20pt 24pt;">
  <h2 style="font-size: 24pt; color: #FFFFFF;">Title</h2>
  <p  style="font-size: 14pt; color: #DDEEFF;">First paragraph of body text.</p>
  <p  style="font-size: 14pt; color: #FFD166;">Second paragraph: change color for emphasis.</p>
  <p  style="font-size: 14pt; color: #DDEEFF;">Third paragraph: keep writing in the same text frame.</p>
</div>
```

**Preserved styles** (per-paragraph, written as run options): `font-size`, `color`, `font-family`, `font-weight` (bold), `font-style` (italic), `text-decoration: underline`, inline styles on `<b>/<i>/<u>/<strong>/<em>/<span>`.

**Taken from the first paragraph and unified across the frame**: `text-align`, `line-height`. Because PowerPoint's alignment and line-height are paragraph/textbox-level — one frame can hold only one alignment. If multiple paragraphs differ, don't use merge, let them stay independent.

**The container's own `background`/`border`/`box-shadow`/`border-radius`** still render as a shape, with exactly the same behavior as a normal div — meaning a blue card background + text is still "shape + text frame" in two layers, just with the text layer collapsed from 3-4 frames into 1.

**Limitations**:
- You can't nest `data-pptx-merge` (errors out).
- The container can't use `background-image` (same as rule 4 of the 4 hard constraints).
- Don't put more child divs with `background`/`border` inside the container — they still render as independent shapes, but the text inside has already been merged out, so you may get visual misalignment.

**When to use**: scenarios where the content will be edited repeatedly and continue to be edited in PPT. No need to add it for one-shot archival exports — the behavior is the same.

---

## Path A HTML Template Skeleton

One independent HTML file per slide, scopes isolated from each other (avoiding the CSS pollution of single-file decks).

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 960pt; height: 540pt;           /* ⚠️ Match LAYOUT_WIDE */
    font-family: system-ui, -apple-system, "PingFang SC", sans-serif;
    background: #FEFEF9;                    /* Solid color, no gradient */
    overflow: hidden;
  }
  /* DIVs handle layout / background / border */
  .card {
    position: absolute;
    background: #1A4A8A;                    /* Background on the DIV */
    border-radius: 4pt;
    padding: 12pt 16pt;
  }
  /* Text tags only carry typography — no background / border */
  .card h2 { font-size: 24pt; color: #FFFFFF; font-weight: 700; }
  .card p  { font-size: 14pt; color: rgba(255,255,255,0.85); }
</style>
</head>
<body>

  <!-- Title area: outer div positions, inner text tags carry the text -->
  <div style="position: absolute; top: 40pt; left: 60pt; right: 60pt;">
    <h1 style="font-size: 36pt; color: #1A1A1A; font-weight: 700;">Use an assertion as the title, not a topic word</h1>
    <p style="font-size: 16pt; color: #555555; margin-top: 10pt;">Subtitle supplements</p>
  </div>

  <!-- Content card: div carries the background, h2/p carry the text -->
  <div class="card" style="top: 130pt; left: 60pt; width: 240pt; height: 160pt;">
    <h2>Point one</h2>
    <p>Brief explanation</p>
  </div>

  <!-- List: use ul/li, not manual • characters -->
  <div style="position: absolute; top: 320pt; left: 60pt; width: 540pt;">
    <ul style="font-size: 16pt; color: #1A1A1A; padding-left: 24pt; list-style: disc;">
      <li>First bullet</li>
      <li>Second bullet</li>
      <li>Third bullet</li>
    </ul>
  </div>

  <!-- Illustration: <img> tag, not background-image -->
  <img src="illustration.png" style="position: absolute; right: 60pt; top: 110pt; width: 320pt; height: 240pt;" />

</body>
</html>
```

---

## Common Errors Quick Reference

| Error message | Cause | Fix |
|---------|------|---------|
| `DIV element contains unwrapped text "XXX"` | Raw text inside a div | Wrap the text in `<p>` or `<h1>`-`<h6>` |
| `CSS gradients are not supported` | Used linear/radial-gradient | Switch to solid color, or split with flex children |
| `Text element <p> has background` | `<p>` tag has a background | Wrap with an outer `<div>` to carry the background; `<p>` only carries the text |
| `Background images on DIV elements are not supported` | div uses background-image | Switch to an `<img>` tag |
| `HTML content overflows body by Xpt vertically` | Content exceeds 540pt | Reduce content or shrink the font, or `overflow: hidden` to clip |
| `HTML dimensions don't match presentation layout` | body size doesn't match pres layout | Use `960pt × 540pt` with `LAYOUT_WIDE`; or defineLayout with custom dimensions |
| `Text box "XXX" ends too close to bottom edge` | A large-font `<p>` is less than 0.5 inch from the body bottom | Move it up, leave bottom margin; the very bottom of PPT is partly hidden anyway |

---

## Basic Workflow (3 steps to PPTX)

### Step 1: write per-slide independent HTML to the constraints

```
My Deck/
├── slides/
│   ├── 01-cover.html    # each file is a complete 960×540pt HTML
│   ├── 02-agenda.html
│   └── ...
└── illustration/        # all images referenced by <img>
    ├── chart1.png
    └── ...
```

### Step 2: write build.js that calls `html2pptx.js`

```js
const pptxgen = require('pptxgenjs');
const html2pptx = require('../scripts/html2pptx.js');  // this skill's script

(async () => {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';  // 13.333 × 7.5 inch, matches HTML's 960×540pt

  const slides = ['01-cover.html', '02-agenda.html', '03-content.html'];
  for (const file of slides) {
    await html2pptx(`./slides/${file}`, pres);
  }

  await pres.writeFile({ fileName: 'deck.pptx' });
})();
```

### Step 3: open and check

- Open the exported PPTX in PowerPoint/Keynote
- Double-clicking any text should let you edit it directly (if it's an image, rule 1 was violated)
- Verify overflow: every slide should be within the body area, nothing clipped

---

## This Path vs. Other Options (what to pick when)

| Need | Pick |
|------|------|
| Colleagues will edit text in PPTX / send to non-technical people to keep editing | **This path** (editable, must write HTML to the 4 constraints from the start) |
| Just for presenting / sending to archive, no more editing | `export_deck_pdf.mjs` (multi-file) or `export_deck_stage_pdf.mjs` (single-file deck-stage) — vector PDF |
| Visual freedom is the priority (animation, web component, CSS gradient, complex SVG) and you accept non-editable | **PDF** (same as above) — PDF is both faithful and cross-platform, more suitable than an "image PPTX" |

**Never force `html2pptx` to run on HTML written for visual freedom** — in practice visual-driven HTML's pass rate on html2pptx is <30%, and retrofitting the rest page-by-page is slower than rewriting. That scenario should ship a PDF, not jam a PPTX through.

---

## Fallback: Visual Mock Already Exists but the User Insists on Editable PPTX

Occasionally you'll hit this scenario: you/the user have already written a visually driven HTML (gradients, web components, complex SVG all used), and PDF would be the right deliverable, but the user explicitly says "no, it has to be editable PPTX".

**Don't force `html2pptx` to run hoping it'll pass** — in practice, visual-driven HTML's pass rate on html2pptx is <30%, and the other 70% will error out or render wrong. The correct fallback is:

### Step 1 · Disclose the limitations first (transparent communication)

In one sentence, make these three things clear to the user:

> "Your current HTML uses [list specifically: gradients / web component / complex SVG / ...], and converting directly to editable PPTX will fail. I have two options:
> - A. **Ship a PDF** (recommended) — visual is preserved 100%, the recipient can view and print but cannot edit the text
> - B. **Treat the visual mock as a blueprint and rewrite an editable HTML version** (preserving the design decisions for color / layout / copy, but reorganizing the HTML structure to the 4 hard constraints, **giving up** visual capabilities like gradients, web component, complex SVG, etc.) → then export editable PPTX
>
> Which one do you want?"

Don't make option B sound breezy — explicitly tell them **what will be lost**. Let the user decide.

### Step 2 · If the user picks B: the AI does the rewriting, don't ask the user to

The doctrine here is: **the user gives design intent, you turn it into a compliant implementation**. Don't expect the user to learn the 4 hard constraints and rewrite it themselves.

Principles to follow when rewriting:
- **Preserve**: color system (primary / accent / neutral), information hierarchy (title / subtitle / body / annotation), core copy, layout skeleton (top-middle-bottom / left-right columns / grid), page rhythm
- **Downgrade**: CSS gradient → solid color or flex segments, web component → paragraph-level HTML, complex SVG → simplified `<img>` or solid-color geometry, shadow → remove or reduce to very faint, custom font → align with system fonts
- **Rewrite**: raw text → wrap in `<p>` / `<h*>`, `background-image` → `<img>` tag, background/border on `<p>` → moved onto outer div

### Step 3 · Produce a before/after list (transparent delivery)

After the rewrite, give the user a before/after diff so they know which visual details were simplified:

```
Original design → editable adjustment
- Purple gradient in the title area → primary color #5B3DE8 solid background
- Shadow on data cards → removed (replaced with a 2pt outline)
- Complex SVG line chart → simplified to <img> PNG (screenshot from HTML)
- Hero-area web-component animation → static first frame (web components cannot be translated)
```

### Step 4 · Export & dual-format delivery

- The `editable` HTML version → run `scripts/export_deck_pptx.mjs` to get an editable PPTX
- **Recommend also keeping** the original visual mock → run `scripts/export_deck_pdf.mjs` for a high-fidelity PDF
- Deliver both formats to the user: the PDF of the visual mock + the editable PPTX, each doing its job

### When to refuse option B outright

In some scenarios the cost of rewriting is too high and you should talk the user out of editable PPTX:
- The core value of the HTML is animation or interaction (after rewriting, only the static first frame is left — 50%+ of the information is lost)
- More than 30 pages, rewriting takes more than 2 hours
- The visual design relies deeply on precise SVG / custom filters (the rewrite is almost unrelated to the original)

Tell the user in this case: "The rewrite cost for this deck is too high — I recommend shipping a PDF instead of PPTX. If the recipient really needs the pptx format, accept that the visuals will be heavily simplified — do you want to switch to PDF instead?"

---

## Why the 4 Constraints Aren't Bugs but Physical Constraints

These 4 aren't `html2pptx.js`'s author being lazy — they are **constraints of the PowerPoint file format (OOXML) itself** projected onto HTML:

- Text in PPTX must be inside a text frame (`<a:txBody>`), corresponding to a paragraph-level HTML element
- PPTX's shape and text frame are two separate objects — you can't draw a background and write text on the same element
- PPTX's shape fill has limited gradient support (only certain preset gradients; arbitrary CSS angle gradients are not supported)
- PPTX's picture object must reference a real image file, not a CSS property

Once you internalize this: **don't expect the tool to get smarter** — it's the HTML that has to adapt to the PPTX format, not the other way around.
