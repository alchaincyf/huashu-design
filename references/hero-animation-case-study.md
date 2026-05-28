# Gallery Ripple + Multi-Focus · Scene Choreography Philosophy

> A reusable visual choreography structure distilled from the Huashu Design hero animation v9 (25s, 8 scenes).
> Not an animation production pipeline — this is about **when this choreography is "right"**.
> Real reference: [demos/hero-animation-v9.mp4](../demos/hero-animation-v9.mp4) · [https://www.huasheng.ai/huashu-design-hero/](https://www.huasheng.ai/huashu-design-hero/)

## One-line lead

> **When you have 20+ visually homogeneous assets and the scene needs to express "scale and depth", reach for Gallery Ripple + Multi-Focus instead of stacking typography.**

Generic SaaS feature animations, product launches, skill promos, portfolio reels — as long as the asset count is high enough and the style is consistent, this structure almost always works.

---

## What this technique actually expresses

It isn't "showing off assets" — it tells a story through **two rhythm shifts**:

**Beat one · Ripple expansion (~1.5s)**: 48 cards radiate outward from the center; the audience is struck by the *quantity* — "oh, this thing has produced that much".

**Beat two · Multi-Focus (~8s, 4 cycles)**: while the camera slow-pans, 4 times the background is dimmed + desaturated and a single card is enlarged to screen center — the audience switches from "the shock of quantity" to "the gaze of quality", each beat steady at 1.7s.

**Core narrative structure**: **Scale (Ripple) → Gaze (Focus × 4) → Fade-out (Walloff)**. The three beats combined express "Breadth × Depth" — not just that you can do a lot, but that every single one is worth pausing on.

Contrast with counterexamples:

| Approach | Audience perception |
|------|---------|
| 48 cards arranged statically (no Ripple) | Pretty but no narrative — looks like a grid screenshot |
| Cards cut one by one (no Gallery context) | Feels like a slideshow, the "scale" is lost |
| Ripple but no Focus | They're shocked but won't remember any specific card |
| **Ripple + Focus × 4 (this recipe)** | **Shocked by quantity, then gaze at quality, then fade calmly — a complete emotional arc** |

---

## Preconditions (all four required)

This choreography **isn't universal**. All four conditions below must hold:

1. **Asset count ≥ 20, ideally 30+**
   Fewer than 20 and the Ripple looks "thin" — you need every cell of 48 to be moving for the density to register. v9 uses 48 cells × 32 images (cycled).

2. **Visually consistent assets**
   All 16:9 slide previews / all app screenshots / all cover designs — aspect ratio, palette and layout have to look like "a set". Mixing makes the Gallery feel like a clipboard.

3. **Each asset still has readable information when enlarged**
   Focus blows a card up to 960px wide. If the source goes blurry or feels information-thin at that size, the Focus beat is wasted. Reverse test: can you pick 4 out of 48 as "most representative"? If you can't, the asset quality isn't even.

4. **Scene is landscape or square, not portrait**
   The Gallery's 3D tilt (`rotateX(14deg) rotateY(-10deg)`) needs lateral extension; portrait makes the tilt look narrow and awkward.

**Fallbacks when a condition is missing**:

| Missing | Degrade to |
|-------|-----------|
| Fewer than 20 assets | Switch to "3–5 side-by-side static display + focus each in turn" |
| Inconsistent style | Switch to "cover + 3 chapter hero images" keynote-style |
| Thin information | Switch to "data-driven dashboard" or "headline + big type" |
| Portrait scene | Switch to "vertical scroll + sticky cards" |

---

## Technical recipe (v9 production parameters)

### 4-Layer structure

```
viewport (1920×1080, perspective: 2400px)
  └─ canvas (4320×2520, large overflow) → 3D tilt + pan
      └─ 8×6 grid = 48 cards (gap 40px, padding 60px)
          └─ img (16:9, border-radius 9px)
      └─ focus-overlay (absolute center, z-index 40)
          └─ img (matches selected slide)
```

**Key**: the canvas is 2.25× the viewport — this is what makes the pan feel like "peeking into a larger world".

### Ripple expansion (distance-delay algorithm)

```js
// Each card's entry time = distance-from-center × 0.8s delay
const col = i % 8, row = Math.floor(i / 8);
const dc = col - 3.5, dr = row - 2.5;       // offset to center
const dist = Math.hypot(dc, dr);
const maxDist = Math.hypot(3.5, 2.5);
const delay = (dist / maxDist) * 0.8;       // 0 → 0.8s
const localT = Math.max(0, (t - rippleStart - delay) / 0.7);
const opacity = expoOut(Math.min(1, localT));
```

**Core parameters**:
- Total duration 1.7s (`T.s3_ripple: [8.3, 10.0]`)
- Max delay 0.8s (center first, corners last)
- Per-card entry duration 0.7s
- Easing: `expoOut` (explosive, not smooth)

**Simultaneously**: canvas scales from 1.25 → 0.94 (zoom out to reveal) — synced "pulling-back" feeling that matches the appearance.

### Multi-Focus (4 beats)

```js
T.focuses = [
  { start: 11.0, end: 12.7, idx: 2  },  // 1.7s
  { start: 13.3, end: 15.0, idx: 3  },  // 1.7s
  { start: 15.6, end: 17.3, idx: 10 },  // 1.7s
  { start: 17.9, end: 19.6, idx: 16 },  // 1.7s
];
```

**Rhythm**: each focus is 1.7s with a 0.6s breath between. 8s total (11.0–19.6s).

**Inside each focus**:
- In ramp: 0.4s (`expoOut`)
- Hold: middle 0.9s (`focusIntensity = 1`)
- Out ramp: 0.4s (`easeOut`)

**Background change (this is the key)**:

```js
if (focusIntensity > 0) {
  const dimOp = entryOp * (1 - 0.6 * focusIntensity);  // dim to 40%
  const brt = 1 - 0.32 * focusIntensity;                // brightness 68%
  const sat = 1 - 0.35 * focusIntensity;                // saturate 65%
  card.style.filter = `brightness(${brt}) saturate(${sat})`;
}
```

**Not just opacity — also desaturate + darken at the same time**. This lets the foreground overlay's colors "pop", instead of just "getting a bit brighter".

**Focus overlay size animation**:
- From 400×225 (entry) → 960×540 (hold state)
- 3 layers of shadow + a 3px accent-colored outline ring around it, giving the "framed" feeling

### Pan (continuous motion so the still doesn't get boring)

```js
const panT = Math.max(0, t - 8.6);
const panX = Math.sin(panT * 0.12) * 220 - panT * 8;
const panY = Math.cos(panT * 0.09) * 120 - panT * 5;
```

- Sine wave + linear drift, two layers of motion — not a pure loop; the position is different at every moment
- X/Y frequencies differ (0.12 vs 0.09) so the audience can't pick out a "regular cycle"
- Clamped at ±900/500px to prevent drifting off-canvas

**Why not pure linear pan**: with a pure linear pan the audience can "predict" the next second; sine+drift makes every second new, and under the 3D tilt it produces a "slight seasickness" (the good kind) that keeps attention locked.

---

## 5 reusable patterns (distilled from the v6→v9 iteration)

### 1. **expoOut as the primary easing, not cubicOut**

`easeOut = 1 - (1-t)³` (smooth) vs `expoOut = 1 - 2^(-10t)` (burst then quick settle).

**Why pick it**: expoOut hits 90% of the way in the first 30% — more like physical damping, matching the intuition of "something heavy landing". Especially good for:
- Card entries (sense of weight)
- Ripple expansion (shockwave)
- Brand float-up (landing-in-place)

**When cubicOut still wins**: focus out ramps, symmetric micro-motion.

### 2. **Paper-tone ground + terracotta orange accent (Anthropic lineage)**

```css
--bg: #F7F4EE;        /* warm paper */
--ink: #1D1D1F;       /* near black */
--accent: #D97757;    /* terracotta orange */
--hairline: #E4DED2;  /* warm hairline */
```

**Why**: warm bases still feel like they "breathe" after GIF compression, unlike pure white which reads as "screen". Terracotta orange as the single accent runs through terminal prompts, dir-card selection, the cursor, brand hyphen, focus ring — every visual anchor is strung together by this one color.

**Lesson from v5**: added a noise overlay to simulate "paper grain", which torched GIF frame compression (every frame different). v6 switched to "base color + warm shadow only" — paper feel preserved at 90% and GIF size dropped 60%.

### 3. **Two-tier shadow simulates depth, no true 3D**

```css
.gallery-card.depth-near { box-shadow: 0 32px 80px -22px rgba(60,40,20,0.22), ... }
.gallery-card.depth-far  { box-shadow: 0 14px 40px -16px rgba(60,40,20,0.10), ... }
```

A deterministic `sin(i × 1.7) + cos(i × 0.73)` assigns each card one of three near/mid/far shadow tiers — **visually feels like "3D stacking", but no transform changes per frame, so GPU cost is zero**.

**Cost of real 3D**: every card needs its own `translateZ`, and the GPU computes 48 transforms + shadow blurs per frame. v4 tried this; Playwright struggled at 25fps. v6's two-tier shadow looks <5% different to the eye but costs 10× less.

### 4. **Font weight variation (font-variation-settings) feels more cinematic than scale**

```js
const wght = 100 + (700 - 100) * morphP;  // 100 → 700 over 0.9s
wordmark.style.fontVariationSettings = `"wght" ${wght.toFixed(0)}`;
```

The brand wordmark morphs from Thin → Bold over 0.9s, paired with a letter-spacing nudge (-0.045 → -0.048em).

**Why it beats scale animation**:
- The audience has seen scale animations too many times; expectation is locked in
- Weight variation reads as "internal filling-out", like a balloon inflating, not "being pushed forward"
- Variable fonts only became common post-2020, so audiences subconsciously read it as "modern"

**Constraint**: needs a variable-font typeface (Inter / Roboto Flex / Recursive etc.). Static fonts can only fake it (cycling several fixed weights produces a jump).

### 5. **Corner Brand — low-intensity persistent signature**

During the Gallery phase, the top-left corner shows a small `HUASHU · DESIGN` mark — 16% opacity, 12px, wide letter-spacing.

**Why add it**:
- After the Ripple burst the audience can "lose focus" and forget what they're watching; a small top-left mark anchors them
- More upscale than a full-screen logo — people who do branding know that a brand signature doesn't need to shout
- If the GIF is screenshot and shared, an attribution signal still remains

**Rule**: only appears in the middle (busy frames); off during the opening (don't cover terminal); off during the close (brand reveal is the lead).

---

## Counter-cases: when NOT to use this choreography

**Bad fit — product demos (showing features)**: Gallery flashes every card past; the audience won't remember any one feature. Use "single-screen focus + tooltip annotations" instead.

**Bad fit — data-driven content**: audience needs to read numbers; Gallery's quick rhythm doesn't give them time. Use "data charts + item-by-item reveal".

**Bad fit — story narrative**: Gallery is "parallel" structure; story needs "causal". Use keynote chapter transitions.

**Bad fit — only 3–5 assets**: Ripple density isn't there; it looks like "patching". Use "static layout + highlight each in turn".

**Bad fit — portrait (9:16)**: 3D tilt needs lateral extension; portrait makes the tilt look "crooked" rather than "unfolding".

---

## How to judge whether your task fits this choreography

Three-step quick check:

**Step 1 · Asset count**: count your homogeneous visual assets. <15 → stop; 15–25 → marginal; 25+ → go.

**Step 2 · Consistency test**: put 4 random assets side by side — do they look like "a set"? If not, unify the style first, or switch approach.

**Step 3 · Narrative match**: are you expressing "Breadth × Depth" (quantity × quality)? Or "process / function / story"? If not the first, don't force it.

Three yeses, just fork the v6 HTML, swap the `SLIDE_FILES` array and the timeline — that's all you need. Change `--bg / --accent / --ink` to reskin without changing the bones.

---

## Related References

- Full technical pipeline: [references/animations.md](animations.md) · [references/animation-best-practices.md](animation-best-practices.md)
- Animation export pipeline: [references/video-export.md](video-export.md)
- Audio config (BGM + SFX twin-track): [references/audio-design-rules.md](audio-design-rules.md)
- Apple-gallery-style lateral reference: [references/apple-gallery-showcase.md](apple-gallery-showcase.md)
- Source HTML (v6 + audio-integrated): `www.huasheng.ai/huashu-design-hero/index.html`
