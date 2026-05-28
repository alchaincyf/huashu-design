# Apple Gallery Showcase · Gallery Wall Animation Style

> Inspiration: the Claude Design site hero video + Apple product-page "work-wall" presentation
> Real-world source: huashu-design launch hero v5
> Use case: **product launch hero animations, skill-capability demos, portfolio showcases** — any scene that needs to display "many high-quality outputs" simultaneously and steer attention through them

---

## Trigger judgement: when to use this style

**Good fit**:
- 10+ real outputs to show on the same canvas (slides, apps, web pages, infographics)
- Audience is professional (developers, designers, PMs) and sensitive to "craft"
- The tone you want to convey is "restrained, exhibition-grade, upscale, with spatial presence"
- You need focus and overall view at the same time (see detail without losing the whole)

**Bad fit**:
- Single-product focus (use the product-hero template in frontend-design)
- Emotion-driven / narrative-heavy animations (use a timeline narrative template)
- Small / portrait screens (the tilted perspective gets blurry at small sizes)

---

## Core visual tokens

```css
:root {
  /* Light-mode gallery palette */
  --bg:         #F5F5F7;   /* main canvas base — Apple site gray */
  --bg-warm:    #FAF9F5;   /* warm off-white variant */
  --ink:        #1D1D1F;   /* primary type color */
  --ink-80:     #3A3A3D;
  --ink-60:     #545458;
  --muted:      #86868B;   /* secondary text */
  --dim:        #C7C7CC;
  --hairline:   #E5E5EA;   /* card 1px border */
  --accent:     #D97757;   /* terracotta orange — Claude brand */
  --accent-deep:#B85D3D;

  --serif-cn: "Noto Serif SC", "Songti SC", Georgia, serif;
  --serif-en: "Source Serif 4", "Tiempos Headline", Georgia, serif;
  --sans:     "Inter", -apple-system, "PingFang SC", system-ui;
  --mono:     "JetBrains Mono", "SF Mono", ui-monospace;
}
```

**Key principles**:
1. **Never use pure black background.** Black makes the work look like a film, not "a work output someone could adopt"
2. **Terracotta orange is the only chromatic accent**; everything else is grayscale + white
3. **Three-typeface stack** (English serif + Chinese serif + sans + mono) creates an "editorial publication" feel, not "internet product"

---

## Core layout patterns

### 1. Floating card (the basic unit of the whole style)

```css
.gallery-card {
  background: #FFFFFF;
  border-radius: 14px;
  padding: 6px;                          /* the padding is the "mat" */
  border: 1px solid var(--hairline);
  box-shadow:
    0 20px 60px -20px rgba(29, 29, 31, 0.12),   /* main shadow, soft and long */
    0 6px 18px -6px rgba(29, 29, 31, 0.06);     /* secondary near light, creates float */
  aspect-ratio: 16 / 9;                  /* uniform slide ratio */
  overflow: hidden;
}
.gallery-card img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 9px;                    /* slightly smaller than card radius, visual nesting */
}
```

**Counter-example**: don't tile edge-to-edge (no padding / no border / no shadow) — that's infographic density expression, not exhibition.

### 2. 3D-tilted work wall

```css
.gallery-viewport {
  position: absolute; inset: 0;
  overflow: hidden;
  perspective: 2400px;                   /* deeper perspective so the tilt isn't extreme */
  perspective-origin: 50% 45%;
}
.gallery-canvas {
  width: 4320px;                         /* canvas = 2.25× viewport */
  height: 2520px;                        /* leaves room to pan */
  transform-origin: center center;
  transform: perspective(2400px)
             rotateX(14deg)              /* tilt back */
             rotateY(-10deg)             /* turn left */
             rotateZ(-2deg);             /* slight skew, removes the too-tidy feel */
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 40px;
  padding: 60px;
}
```

**Parameter sweet spots**:
- rotateX: 10–15deg (any more and it looks like a VIP cocktail-party backdrop)
- rotateY: ±8–12deg (left/right symmetry)
- rotateZ: ±2–3deg (the "this wasn't placed by a machine" human touch)
- perspective: 2000–2800px (under 2000 fisheyes, over 3000 approaches orthographic)

### 3. 2×2 four-corner convergence (selection scene)

```css
.grid22 {
  display: grid;
  grid-template-columns: repeat(2, 800px);
  gap: 56px 64px;
  align-items: start;
}
```

Each card slides in from its corresponding corner (tl/tr/bl/br) toward the center + fade in. Matching `cornerEntry` vectors:

```js
const cornerEntry = {
  tl: { dx: -700, dy: -500 },
  tr: { dx:  700, dy: -500 },
  bl: { dx: -700, dy:  500 },
  br: { dx:  700, dy:  500 },
};
```

---

## Five core animation patterns

### Pattern A · Four-corner convergence (0.8–1.2s)

4 elements slide in from the viewport corners, simultaneously scaling 0.85→1.0, with ease-out. Good for an opener that "shows multi-directional choice".

```js
const inP = easeOut(clampLerp(t, start, end));
card.style.transform = `translate3d(${(1-inP)*ce.dx}px, ${(1-inP)*ce.dy}px, 0) scale(${0.85 + 0.15*inP})`;
card.style.opacity = inP;
```

### Pattern B · Selection zoom + others slide out (0.8s)

The selected card scales 1.0→1.28; the others fade out + blur + drift back to the corners:

```js
// Selected
card.style.transform = `translate3d(${cellDx*outP}px, ${cellDy*outP}px, 0) scale(${1 + 0.28*easeOut(zoomP)})`;
// Not selected
card.style.opacity = 1 - outP;
card.style.filter = `blur(${outP * 1.5}px)`;
```

**Key**: non-selected cards must blur, not just fade. Blur simulates depth-of-field and visually "pushes the selected one forward".

### Pattern C · Ripple expansion (1.7s)

From center outward, delay by distance — each card fades in + scales from 1.25x to 0.94x ("camera pulls back"):

```js
const col = i % COLS, row = Math.floor(i / COLS);
const dc = col - (COLS-1)/2, dr = row - (ROWS-1)/2;
const dist = Math.sqrt(dc*dc + dr*dr);
const delay = (dist / maxDist) * 0.8;
const localT = Math.max(0, (t - rippleStart - delay) / 0.7);
card.style.opacity = easeOut(Math.min(1, localT));

// Simultaneously the whole gallery scales 1.25 → 0.94
const galleryScale = 1.25 - 0.31 * easeOut(rippleProgress);
```

### Pattern D · Sinusoidal Pan (continuous drift)

Sine wave + linear drift combined to avoid the "marquee" feel of "has-a-start-has-an-end" loops:

```js
const panX = Math.sin(panT * 0.12) * 220 - panT * 8;    // horizontal left drift
const panY = Math.cos(panT * 0.09) * 120 - panT * 5;    // vertical up drift
const clampedX = Math.max(-900, Math.min(900, panX));   // prevent edge reveal
```

**Parameters**:
- Sine period `0.09–0.15 rad/s` (slow — about 30–50 seconds per swing)
- Linear drift `5–8 px/s` (slower than the audience's blink)
- Amplitude `120–220 px` (big enough to feel, small enough not to nauseate)

### Pattern E · Focus Overlay (focus switching)

**Key design**: the focus overlay is a **flat element** (no tilt), floating above the tilted canvas. The selected slide scales from its tile position (~400×225) up to screen center (960×540); the background canvas doesn't change tilt but **dims to 45%**:

```js
// Focus overlay (flat, centered)
focusOverlay.style.width = (startW + (endW - startW) * focusIntensity) + 'px';
focusOverlay.style.height = (startH + (endH - startH) * focusIntensity) + 'px';
focusOverlay.style.opacity = focusIntensity;

// Background cards dim but stay visible (key! never go to 100% mask)
card.style.opacity = entryOp * (1 - 0.55 * focusIntensity);   // 1 → 0.45
card.style.filter = `brightness(${1 - 0.3 * focusIntensity})`;
```

**Sharpness ironclad rule**:
- The focus overlay's `<img>` must `src` directly to the original, **never reuse the compressed thumbnail in the gallery**
- Preload every original into a `new Image()[]` array
- The overlay's own `width/height` is computed per frame; the browser resamples the source each frame

---

## Timeline architecture (reusable skeleton)

```js
const T = {
  DURATION: 25.0,
  s1_in: [0.0, 0.8],    s1_type: [1.0, 3.2],  s1_out: [3.5, 4.0],
  s2_in: [3.9, 5.1],    s2_hold: [5.1, 7.0],  s2_out: [7.0, 7.8],
  s3_hold: [7.8, 8.3],  s3_ripple: [8.3, 10.0],
  panStart: 8.6,
  focuses: [
    { start: 11.0, end: 12.7, idx: 2  },
    { start: 13.3, end: 15.0, idx: 3  },
    { start: 15.6, end: 17.3, idx: 10 },
    { start: 17.9, end: 19.6, idx: 16 },
  ],
  s4_walloff: [21.1, 21.8], s4_in: [21.8, 22.7], s4_hold: [23.7, 25.0],
};

// Core easings
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
function lerp(time, start, end, fromV, toV, easing) {
  if (time <= start) return fromV;
  if (time >= end) return toV;
  let p = (time - start) / (end - start);
  if (easing) p = easing(p);
  return fromV + (toV - fromV) * p;
}

// Single render(t) reads the timestamp and writes every element
function render(t) { /* ... */ }
requestAnimationFrame(function tick(now) {
  const t = ((now - startMs) / 1000) % T.DURATION;
  render(t);
  requestAnimationFrame(tick);
});
```

**Essence of the architecture**: **every state derives from the timestamp t** — no state machine, no setTimeout. This way:
- Jump to any moment instantly with `window.__setTime(12.3)` (great for Playwright frame-by-frame capture)
- Loop is naturally seamless (t mod DURATION)
- Freeze any frame for debug

---

## Craft details (easy to skip, fatal to skip)

### 1. SVG noise texture

A light base's worst enemy is "too flat". Layer in a very weak fractalNoise:

```html
<style>
.stage::before {
  content: '';
  position: absolute; inset: 0;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.078  0 0 0 0 0.078  0 0 0 0 0.074  0 0 0 0.035 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: 0.5;
  pointer-events: none;
  z-index: 30;
}
</style>
```

Looks like nothing — remove it and you'll feel the difference.

### 2. Corner brand mark

```html
<div class="corner-brand">
  <div class="mark"></div>
  <div>HUASHU · DESIGN</div>
</div>
```

```css
.corner-brand {
  position: absolute; top: 48px; left: 72px;
  font-family: var(--mono);
  font-size: 12px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--muted);
}
```

Only appears during the work-wall scene, fades in and out. Like a museum wall label.

### 3. Brand-closing wordmark

```css
.brand-wordmark {
  font-family: var(--sans);
  font-size: 148px;
  font-weight: 700;
  letter-spacing: -0.045em;   /* negative tracking is key — packs the type into a mark */
}
.brand-wordmark .accent {
  color: var(--accent);
  font-weight: 500;           /* accent character is lighter — visual contrast */
}
```

`letter-spacing: -0.045em` is Apple product-page standard practice for headline type.

---

## Common failure modes

| Symptom | Cause | Fix |
|---|---|---|
| Looks like a PPT template | Cards have no shadow / hairline | Add two layers of box-shadow + 1px border |
| Tilt feels cheap | Only rotateY, no rotateZ | Add ±2–3deg rotateZ to break perfection |
| Pan feels "stuttery" | Uses setTimeout or CSS keyframe loops | Use rAF + sin/cos continuous functions |
| Type unreadable in focus | Reusing the gallery's low-res thumbnail | Independent overlay + direct original src |
| Background too empty | Pure `#F5F5F7` | Layer SVG fractalNoise at 0.5 opacity |
| Type feels "internet-y" | Only Inter | Add Serif (one CN + one EN) + mono, 3-stack |

---

## References

- Full implementation sample (the original author's reference file — not bundled with this skill)
- Original inspiration: claude.ai/design hero video
- Aesthetic references: Apple product pages, Dribbble shot collection pages

When you face a "many high-quality outputs to display" animation task, copy the skeleton from this file, swap content + tune timing.
