# Animation Best Practices · Positive-Direction Animation Design Grammar

> Based on deep teardowns of three official Anthropic product animations (Claude Design / Claude Code Desktop / Claude for Word),
> distilled into "Anthropic-grade" animation design rules.
>
> Pair with `animation-pitfalls.md` (the anti-patterns list). This file is "**do it this way**,"
> pitfalls is "**don't do it this way**." They're orthogonal — read both.
>
> **Constraint statement**: this file only covers **motion logic and expressive style**, it introduces **no specific brand color values**.
> Color decisions go through §1.a Core Asset Protocol (extracted from a brand spec) or the Design Direction Advisor (Fallback Mode)
> (each of 20 philosophies has its own palette). This reference discusses **how things move**, not **what color** they are.

---

## §0 · Who you are · identity and taste

> Before reading any of the technical rules below, read this section. Rules **emerge from identity** —
> not the other way around.

### §0.1 Identity anchor

**You are a motion designer who has studied the motion archives of Anthropic / Apple / Pentagram / Field.io.**

When you're animating, you're not tweaking CSS transitions — you're using digital elements to **simulate a physical world**,
so the audience's subconscious believes "these are objects with weight, inertia, that overshoot."

You don't make PowerPoint-style animation. You don't make "fade in fade out" animation. You make animation that **convinces people the screen
is a space they can reach into**.

### §0.2 Core beliefs (3)

1. **Animation is physics, not animation curves**
   `linear` is digital, `expoOut` is physical. You believe the pixels on screen deserve to be treated as "objects."
   Every easing choice answers the physical question "how heavy is this element? what's the friction coefficient?"

2. **Time allocation matters more than curve shape**
   Slow-Fast-Boom-Stop is your breath. **Evenly-paced animation is a tech demo; rhythmically-paced animation is narrative.**
   Slowing down at the right moment matters more than using the right easing at the wrong moment.

3. **Yielding to the audience is harder than showing off**
   Holding 0.5 seconds before a key result is **technique**, not compromise. **Giving the human brain time to react is the animator's highest virtue.**
   AI defaults to a pause-less, information-density-maxed animation — that's beginner. What you do is restraint.

### §0.3 Taste standard · what is beautiful

Here is how you judge "good" vs "great." Each has a **recognition method** — when you're looking at a candidate animation,
use these questions to judge whether it's up to standard, instead of mechanically checking 14 rules.

| Dimension of beauty | Recognition method (audience reaction) |
|---|---|
| **Physical weight** | When the animation ends, the element "**lands**" steadily — it doesn't just "**stop**" there. The audience's subconscious feels "this has weight" |
| **Yielding to the audience** | Before key information appears, there's a perceptible pause (≥300ms) — the audience has time to "**see**" it before the next thing happens |
| **Whitespace** | The ending is an abrupt stop + hold, not a fade to black. The last frame is clear, definite, decisive |
| **Restraint** | Only one spot in the whole piece is "120% refined"; the other 80% is just right — **showing off everywhere is a cheap signal** |
| **Hand feel** | Arcs (not straight lines), irregular (not setInterval mechanical rhythm), with breathing |
| **Respect** | Show the tweak process, show the bug fix — **don't hide the work, don't sell "magic."** AI is a collaborator, not a magician |

### §0.4 Self-check · the audience-first-reaction method

After finishing an animation, **what's the audience's first reaction?** — this is the only metric you optimize for.

| Audience reaction | Grade | Diagnosis |
|---|---|---|
| "Looks pretty smooth" | good | Passable but unremarkable — you're making PowerPoint |
| "This animation is really fluid" | good+ | Technique is right but not striking |
| "This thing really looks like it's **lifting off the desktop**" | great | You've touched physical weight |
| "This doesn't look like AI made it" | great+ | You've crossed the Anthropic threshold |
| "I want to **screenshot** this and share it" | great++ | You've made the audience self-propagate |

**The difference between great and good is not technical correctness — it's taste judgment.** Technically correct + taste right = great.
Technically correct + taste absent = good. Technically wrong = not even started.

### §0.5 Relationship between identity and rules

The technical rules in §1–§8 below are this identity's **execution means** in concrete scenarios — not a standalone rule list.

- When you hit a scenario the rules don't cover → return to §0 and judge with **identity**, don't guess
- When rules conflict → return to §0 and use **taste standards** to judge which one wins
- Want to break a rule → first answer: "does doing it this way fulfill one of §0.3's beauties?" If yes, break it; if not, don't.

Good. Read on.

---

## Overview · Animation is physics in three layers

The root of cheapness in most AI-generated animation is — **they behave like "digits" not "objects."**
Real-world objects have mass, inertia, elasticity, overshoot. The root of the "premium feel" in Anthropic's three films
is that they give digital elements a **physical-world motion ruleset**.

This ruleset has 3 layers:

1. **Narrative rhythm layer**: time allocation of Slow-Fast-Boom-Stop
2. **Motion curve layer**: Expo Out / Overshoot / Spring — reject linear
3. **Expressive language layer**: show the process, mouse arc, Logo morph-collapse

---

## 1. Narrative rhythm · Slow-Fast-Boom-Stop 5-segment structure

All three Anthropic films follow this structure without exception:

| Segment | Share | Pacing | Purpose |
|---|---|---|---|
| **S1 Trigger** | ~15% | slow | give the human reaction time, establish realism |
| **S2 Generate** | ~15% | mid | the visual wow point appears |
| **S3 Process** | ~40% | fast | show controllability / density / detail |
| **S4 Boom** | ~20% | Boom | camera pulls back / 3D pop-out / multi-panel surge |
| **S5 Landing** | ~10% | still | brand Logo + abrupt stop |

**Concrete duration mapping** (for a 15-second animation):
S1 Trigger 2s · S2 Generate 2s · S3 Process 6s · S4 Boom 3s · S5 Landing 2s

**Forbidden**:
- ❌ Even pacing (same information density every second) — audience fatigue
- ❌ Sustained high density — no peak, no memorable moment
- ❌ Faded ending (fade out to transparent) — should be an **abrupt stop**

**Self-check**: sketch 5 thumbnails on paper, each representing the climactic frame of one segment. If the 5 sketches don't differ much,
the rhythm isn't doing its job.

---

## 2. Easing philosophy · reject linear, embrace physics

All motion in Anthropic's three films uses Bezier curves with a sense of "damping." The default cubic easeOut
(`1-(1-t)³`) is **not sharp enough** — start isn't fast enough, stop isn't planted enough.

### Three core easings (built into animations.jsx)

```js
// 1. Expo Out · fast start, slow brake (most common, default primary easing)
// CSS equivalent: cubic-bezier(0.16, 1, 0.3, 1)
Easing.expoOut(t) // = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)

// 2. Overshoot · elastic toggle / button pop
// CSS equivalent: cubic-bezier(0.34, 1.56, 0.64, 1)
Easing.overshoot(t)

// 3. Spring physics · geometric settling, natural landing
Easing.spring(t)
```

### Usage mapping

| Scenario | Which easing |
|---|---|
| Card rise-in / panel entrance / Terminal fade / focus overlay | **`expoOut`** (primary easing, most common) |
| Toggle switching / button pop / emphasis interaction | `overshoot` |
| Preview geometric settling / physics landing / UI element bounce | `spring` |
| Sustained motion (e.g. mouse trail interpolation) | `easeInOut` (preserves symmetry) |

### Counterintuitive insight

Most product trailer animation is **too fast, too hard**. `linear` makes digital elements feel like machines, `easeOut` is a baseline,
`expoOut` is the technical root of "premium feel" — it gives digital elements a **sense of physical-world weight**.

---

## 3. Motion language · 8 universal principles

### 3.1 Base color is never pure black or pure white

None of Anthropic's three films uses `#FFFFFF` or `#000000` as the primary base. **Neutral colors with a temperature**
(warm or cool) carry a sense of "paper / canvas / desktop" materiality, weakening the machine feel.

**Concrete color decisions** go through §1.a Core Asset Protocol (extracted from a brand spec) or the Design Direction Advisor (Fallback Mode)
(each of 20 philosophies has its own base color). This reference doesn't give specific values — those are **brand decisions**, not motion rules.

### 3.2 Easing is never linear

See §2.

### 3.3 Slow-Fast-Boom-Stop narrative

See §1.

### 3.4 Show the "process," not the "magic result"

- Claude Design shows tweaks and slider dragging (not one-click generation of a perfect result)
- Claude Code shows code errors + AI fixes (not one-shot success)
- Claude for Word shows Redline red-delete-green-add edits (not just the final draft)

**Shared subtext**: the product is a **collaborator, pair engineer, senior editor** — not a one-click magician.
This pinpoints professional users' pain around "controllability" and "authenticity."

**Anti-AI-slop**: AI defaults to "magic one-click success" animation (one click → perfect result), the generic common-denominator.
**Doing the opposite** — showing the process, showing tweaks, showing bugs and fixes — is what brand identity comes from.

### 3.5 Mouse trail manually drawn (arc + Perlin Noise)

Real human mouse motion isn't a straight line — it's "start accelerate → arc → decelerate-correct → click."
A mouse trail that AI just linearly interpolates **subconsciously feels off**.

```js
// Quadratic Bezier interpolation (start → control point → end)
function bezierQuadratic(p0, p1, p2, t) {
  const x = (1-t)*(1-t)*p0[0] + 2*(1-t)*t*p1[0] + t*t*p2[0];
  const y = (1-t)*(1-t)*p0[1] + 2*(1-t)*t*p1[1] + t*t*p2[1];
  return [x, y];
}

// Path: start → off-center midpoint → end (makes an arc)
const path = [[100, 100], [targetX - 200, targetY + 80], [targetX, targetY]];

// Add tiny Perlin Noise (±2px) on top to simulate "hand jitter"
const jitterX = (simpleNoise(t * 10) - 0.5) * 4;
const jitterY = (simpleNoise(t * 10 + 100) - 0.5) * 4;
```

### 3.6 Logo "morph-collapse" (Morph)

The Logo entrance in all three Anthropic films is **never a simple fade-in** — it's **morphed from the preceding visual element**.

**Common pattern**: in the last 1–2 seconds, do a Morph / Rotate / Converge so the entire narrative "collapses" onto the brand point.

**Low-cost implementation** (without a real morph):
Have the preceding visual element "collapse" into a color block (scale → 0.1, translate to center),
then have the block "expand" into the wordmark. Transition with a 150ms hard cut + motion blur
(`filter: blur(6px)` → `0`).

```js
<Sprite start={13} end={14}>
  {/* Collapse: previous element scale 0.1, opacity stays, filter blur increases */}
  const scale = interpolate(t, [0, 0.5], [1, 0.1], Easing.expoOut);
  const blur = interpolate(t, [0, 0.5], [0, 6]);
</Sprite>
<Sprite start={13.5} end={15}>
  {/* Expand: Logo scales 0.1 → 1 from block center, blur 6 → 0 */}
  const scale = interpolate(t, [0, 0.6], [0.1, 1], Easing.overshoot);
  const blur = interpolate(t, [0, 0.6], [6, 0]);
</Sprite>
```

### 3.7 Serif + sans-serif dual typeface

- **Brand / voiceover**: serif (carries "academic / editorial / taste")
- **UI / code / data**: sans-serif + monospaced

**A single typeface is always wrong.** Serif gives "taste"; sans gives "function."

Specific font choices go through the brand spec (`brand-spec.md`'s Display / Body / Mono stack) or the Design Direction Advisor's
20 philosophies. This reference doesn't name specific fonts — those are **brand decisions**.

### 3.8 Focus switching = background dim + foreground sharpen + Flash guide

Focus switching is **not just** lowering opacity. The full recipe:

```js
// Filter combination on non-focused elements
tile.style.filter = `
  brightness(${1 - 0.5 * focusIntensity})
  saturate(${1 - 0.3 * focusIntensity})
  blur(${focusIntensity * 4}px)        // ← key: blur is what actually makes it "recede"
`;
tile.style.opacity = 0.4 + 0.6 * (1 - focusIntensity);

// After focus completes, do a 150ms Flash highlight at the focus point to guide the eye back
focusOverlay.animate([
  { background: 'rgba(255,255,255,0.3)' },
  { background: 'rgba(255,255,255,0)' }
], { duration: 150, easing: 'ease-out' });
```

**Why blur is essential**: opacity + brightness alone leaves the unfocused elements "sharp" — visually they don't "recede into the background."
blur(4–8px) is what makes the non-focus genuinely drop one layer of depth.

---

## 4. Concrete motion techniques (snippets you can copy)

### 4.1 FLIP / Shared Element Transition

A button "expanding" into an input field is **not** the button disappearing + a new panel appearing. The core is **the same DOM element**
transitioning between two states, not two elements cross-fading.

```jsx
// Using Framer Motion layoutId
<motion.div layoutId="design-button">Design</motion.div>
// ↓ after click, same layoutId
<motion.div layoutId="design-button">
  <input placeholder="Describe your design..." />
</motion.div>
```

Native implementation: see https://aerotwist.com/blog/flip-your-animations/

### 4.2 "Breathing" expansion (width → height)

Expanding a panel is **not pulling width and height simultaneously**, it's:
- First 40% of time: pull width only (keep height small)
- Last 60%: width stays, push height

This simulates the physical-world feeling of "unfold first, then fill with water."

```js
const widthT = interpolate(t, [0, 0.4], [0, 1], Easing.expoOut);
const heightT = interpolate(t, [0.3, 1], [0, 1], Easing.expoOut);
style.width = `${widthT * targetW}px`;
style.height = `${heightT * targetH}px`;
```

### 4.3 Staggered Fade-up (30ms stagger)

When table rows, card columns, or list items enter, **each element is delayed by 30ms**, `translateY` returns from 10px to 0.

```js
rows.forEach((row, i) => {
  const localT = Math.max(0, t - i * 0.03);  // 30ms stagger
  row.style.opacity = interpolate(localT, [0, 0.3], [0, 1], Easing.expoOut);
  row.style.transform = `translateY(${
    interpolate(localT, [0, 0.3], [10, 0], Easing.expoOut)
  }px)`;
});
```

### 4.4 Nonlinear breathing · 0.5s hold before key results

Machines execute fast and continuously, but **hold 0.5 seconds before a key result appears** — give the audience's brain reaction time.

```jsx
// Typical scene: AI finishes generating → hold 0.5s → result emerges
<Sprite start={8} end={8.5}>
  {/* 0.5s pause — nothing moves; let the audience stare at the loading state */}
  <LoadingState />
</Sprite>
<Sprite start={8.5} end={10}>
  <ResultAppear />
</Sprite>
```

**Anti-example**: AI finishes generating and seamlessly cuts straight to the result — audience has no reaction time, information lost.

### 4.5 Chunk Reveal · simulating token streaming

When AI generates text, **don't use `setInterval` to pop characters one at a time** (looks like old-movie subtitles); use **chunk reveal**
— 2–5 characters at once, irregular intervals, simulating real token streaming.

```js
// Split by chunk, not by character
const chunks = text.split(/(\s+|,\s*|\.\s*|;\s*)/);  // split by word + punctuation
let i = 0;
function reveal() {
  if (i >= chunks.length) return;
  element.textContent += chunks[i++];
  const delay = 40 + Math.random() * 80;  // irregular 40-120ms
  setTimeout(reveal, delay);
}
reveal();
```

### 4.6 Anticipation → Action → Follow-through

3 of Disney's 12 principles. Anthropic uses them explicitly:

- **Anticipation**: before the main action, a small reverse motion (button shrinks slightly before popping)
- **Action**: the main motion itself
- **Follow-through**: after the action ends, residual motion (card settles, slight bounce)

```js
// Full three-phase card entrance
const anticip = interpolate(t, [0, 0.2], [1, 0.95], Easing.easeIn);     // anticipation
const action  = interpolate(t, [0.2, 0.7], [0.95, 1.05], Easing.expoOut); // action
const settle  = interpolate(t, [0.7, 1], [1.05, 1], Easing.spring);       // follow-through
// final scale = product of three phases, or piecewise application
```

**Anti-example**: an animation with only Action, no Anticipation + Follow-through, looks like "PowerPoint animation."

### 4.7 3D Perspective + translateZ layering

For the feel of "tilted 3D + floating cards," add perspective to the container and different translateZ to individual elements:

```css
.stage-wrap {
  perspective: 2400px;
  perspective-origin: 50% 30%;  /* slight top-down view */
}
.card-grid {
  transform-style: preserve-3d;
  transform: rotateX(8deg) rotateY(-4deg);  /* golden ratio */
}
.card:nth-child(3n) { transform: translateZ(30px); }
.card:nth-child(5n) { transform: translateZ(-20px); }
.card:nth-child(7n) { transform: translateZ(60px); }
```

**Why rotateX 8° / rotateY -4° is the golden ratio**:
- Greater than 10° → elements feel over-distorted, like they're "falling over"
- Less than 5° → feels like "shear" rather than "perspective"
- 8° × -4° asymmetric ratio simulates the natural angle of "camera looking down from the upper-left of the desktop"

### 4.8 Diagonal pan · move XY simultaneously

Camera motion isn't pure vertical or pure horizontal; **move XY at the same time** to simulate diagonal travel:

```js
const panX = Math.sin(flowT * 0.22) * 40;
const panY = Math.sin(flowT * 0.35) * 30;
stage.style.transform = `
  translate(-50%, -50%)
  rotateX(8deg) rotateY(-4deg)
  translate3d(${panX}px, ${panY}px, 0)
`;
```

**Key**: X and Y use different frequencies (0.22 vs 0.35) to avoid a regular Lissajous loop.

---

## 5. Scene recipes (three narrative templates)

The three reference videos correspond to three product personalities. **Pick the one that best fits your product** — don't mix.

### Recipe A · Apple Keynote dramatic (Claude Design type)

**Fits**: major-version launches, hero animation, visual wow first
**Pacing**: Slow-Fast-Boom-Stop strong arc
**Easing**: `expoOut` throughout + a bit of `overshoot`
**SFX density**: high (~0.4/s), SFX pitch tuned to the BGM scale
**BGM**: IDM / minimal tech-electronic, cool + precise
**Closing**: camera whip-pulls back → drop → Logo morph → ethereal single note → abrupt stop

### Recipe B · One-take tool (Claude Code type)

**Fits**: developer tools, productivity apps, flow scenarios
**Pacing**: sustained steady flow, no obvious peak
**Easing**: `spring` physics + `expoOut`
**SFX density**: **0** (rely purely on BGM to drive edit rhythm)
**BGM**: Lo-fi Hip-hop / Boom-bap, 85–90 BPM
**Core technique**: key UI actions land on BGM kick/snare transients — "**musical groove is the interaction SFX**"

### Recipe C · Office productivity narrative (Claude for Word type)

**Fits**: enterprise software, doc/spreadsheet/calendar, professional first
**Pacing**: multi-scene hard cuts + Dolly In/Out
**Easing**: `overshoot` (toggles) + `expoOut` (panels)
**SFX density**: medium (~0.3/s), mostly UI clicks
**BGM**: Jazzy Instrumental, minor key, BPM 90–95
**Core highlight**: one scene must contain "the highlight of the whole piece" — 3D pop-out / lifting off the plane

---

## 6. Anti-examples · this is AI slop

| Anti-pattern | Why it's wrong | Correct approach |
|---|---|---|
| `transition: all 0.3s ease` | `ease` is a cousin of linear; all elements move at the same speed | Use `expoOut` + per-element stagger |
| All entrances are `opacity 0→1` | No sense of motion direction | Pair with `translateY 10→0` + Anticipation |
| Logo fades in | No narrative resolution | Morph / Converge / collapse-expand |
| Mouse moves in straight lines | Subconscious machine feel | Bezier arc + Perlin Noise |
| Typing pops one character at a time (setInterval) | Looks like old-movie subtitles | Chunk Reveal, random intervals |
| Key result with no hold | Audience has no reaction time | 0.5s hold before the result |
| Focus switch only changes opacity | Non-focus elements still sharp | opacity + brightness + **blur** |
| Pure black / pure white background | Cyber feel / reflective fatigue | Neutral with temperature (via brand spec) |
| All animations equally fast | No rhythm | Slow-Fast-Boom-Stop |
| Fade-out ending | No sense of decision | Abrupt stop (hold the last frame) |

---

## 7. Self-check (60 seconds before delivery)

- [ ] Narrative structure is Slow-Fast-Boom-Stop, not even pacing?
- [ ] Default easing is `expoOut`, not `easeOut` or `linear`?
- [ ] Toggles / button pops use `overshoot`?
- [ ] Card / list entrances have 30ms stagger?
- [ ] 0.5s hold before key results?
- [ ] Typing uses Chunk Reveal, not setInterval single characters?
- [ ] Focus switch adds blur (not just opacity)?
- [ ] Logo is morph-collapse (Morph), not fade-in?
- [ ] Base color is not pure black / pure white (has temperature)?
- [ ] Text has serif + sans hierarchy?
- [ ] Ending is an abrupt stop, not faded?
- [ ] (If there's a mouse) mouse trail is an arc, not a straight line?
- [ ] SFX density matches product personality (see recipes A/B/C)?
- [ ] BGM and SFX have a 6–8dB loudness difference? (see `audio-design-rules.md`)

---

## 8. Relationship to other references

| reference | Role | Relationship |
|---|---|---|
| `animation-pitfalls.md` | Technical pitfalls (16) | "**Don't do this**" — the inverse of this file |
| `animations.md` | Stage/Sprite engine usage | The basics of **how to write** animation |
| `audio-design-rules.md` | Dual-track audio rules | Rules for **adding audio** to animation |
| `sfx-library.md` | 37-SFX list | SFX **asset library** |
| `apple-gallery-showcase.md` | Apple Gallery showcase style | A focused study of one specific motion style |
| **This file** | Positive-direction motion design grammar | "**Do it this way**" |

**Invocation order**:
1. First read SKILL.md Workflow Step 3's four positional questions (decide narrative role and visual temperature)
2. After picking a direction, read this file to determine **motion language** (recipes A/B/C)
3. When writing code, refer to `animations.md` and `animation-pitfalls.md`
4. When exporting video, follow `audio-design-rules.md` + `sfx-library.md`

---

## Appendix · sources for this file

- Anthropic official animation teardown (the original author's reference notes — not bundled with this skill)
- Anthropic audio teardown (companion file in the same source set — not bundled)
- 3 reference videos: `ref-{1,2,3}.mp4` + matching `gemini-ref-*.md` / `audio-ref-*.md` (the original author's source set — not bundled)
- **Strict filter**: this reference contains no specific brand color values, font names, or product names.
  Color/font decisions go through §1.a Core Asset Protocol or the 20 design philosophies.
