# Voiceover Pipeline · Narration-Driven Animation

> Upgrade animations from "silent visuals + post-hoc dubbing" to a workflow where **the narration is written first, then visuals are driven by the audio's measured duration**.
> Use for: 5-20 minute concept explainers, tutorial videos, long-form knowledge explainers.
>
> Pairs with `references/animation-best-practices.md` — this file covers **how to sync narration with visuals**,
> animation-best-practices covers **how each frame should move**.

---

## 🛑 Ironclad Rules · Required Reading Before Writing a Single Line of Code

> **You cannot say this enough: failure mode #1 of narrated animation is making a PowerPoint with voiceover.**

### Rule 1 · The Whole Film Is One Continuous Motion Narrative, Not a Set of Independent Scenes

PowerPoint is 7 slides. What you're making is **1 film, X minutes long**.

**Identity shift**:
- ❌ You're not "making content for 7 scenes"
- ✅ You're "letting one or a few hero elements perform an X-minute play on screen"

**Visual skeleton = one or a few hero elements that persist through the whole film**:
- They appear at t=0 and don't leave until the end
- Each cue is a **state change** of the hero (position / size / color / perspective / form), not "swap in a new element"
- Scene boundaries exist in the script, **but should not exist in the visuals** — viewers shouldn't be able to tell "this is the 3rd scene"; they should see one continuous motion

**Anti-example (skill v1 lessons learned · 2026-05-10)**:
- 7 `<Scene>` blocks each with an independent layout; scene change = whole page opacity 1→0 cutting to the next
- Each cue = `opacity: p, transform: translateY((1-p)*30px)` (monotonic fade-up overuse)
- Result: viewers' first reaction "this looks like one keynote slide after another"; the whole film's quality zeroed out

**Correct pattern**:
- Pick 1-2 hero elements (e.g. for this article's demo, "md" and "html" as the two skeletal characters)
- These two characters **stay on screen from opening to closing**
- Each "scene" is really a state transition of the hero element
  - opening: the two characters face off center screen
  - md-side: md scales up and bolds to dominate the frame, html retreats to a corner as tiny text; data flows around md
  - html-side: html flips to hero; md retreats to a corner
  - the-real-question: both return to center, but a "≠" separator appears between them
  - the-split: both push apart, whitespace opens in the middle
  - activity-proof: they alternately blink along a timeline
  - closing: both settle into their final answer positions
- The whole film becomes "md and html performed for X minutes on screen", not 7 isolated PPT slides

**Minimum implementation skeleton** (copy and adapt):

```jsx
// ── Step 1: Define the hero's target state per scene (position/scale/opacity) ──
const HERO_KEYS = {
  opening:    { md: { x: 50, y: 35, scale: 1.0, opacity: 1 }, html: { x: 50, y: 65, scale: 1.0, opacity: 1 } },
  'md-side':  { md: { x: 78, y: 50, scale: 1.6, opacity: 1 }, html: { x: 92, y: 8,  scale: 0.25, opacity: 0.4 } },
  'html-side':{ md: { x: 8,  y: 8,  scale: 0.25, opacity: 0.4 }, html: { x: 22, y: 50, scale: 1.6, opacity: 1 } },
  // ... one entry per segment; continuous motion runs from previous segment's final → current segment's from
};

// ── Step 2: easing + lerp helpers ──
const expoOut = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpPos = (from, to, t) => ({
  x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t),
  scale: lerp(from.scale, to.scale, t),
  opacity: lerp(from.opacity ?? 1, to.opacity ?? 1, t),
});

// ── Step 3: HeroAnchor component — mounted directly under <NarrationStage>, NOT inside a <Scene> ──
const HeroAnchor = () => {
  const { time, scene, timeline } = useNarration();
  if (!scene) return null;
  const idx = timeline.scenes.findIndex(s => s.id === scene.id);
  const prevId = idx > 0 ? timeline.scenes[idx - 1].id : scene.id;
  const from = HERO_KEYS[prevId];
  const to   = HERO_KEYS[scene.id];

  // First ~45% of segment time used to morph from prev state to current state, hold the rest
  const transitionDur = Math.min(2.0, scene.duration * 0.45);
  const t = expoOut(Math.min(1, (time - scene.start) / transitionDur));
  const md   = lerpPos(from.md,   to.md,   t);
  const html = lerpPos(from.html, to.html, t);

  // Add subtle breathing so every frame has motion (per Rule 3)
  const breath = 1 + Math.sin(time * 0.6) * 0.012;

  const renderHero = (label, pos, color) => (
    <div style={{
      position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`,
      transform: `translate(-50%, -50%) scale(${pos.scale * breath})`,
      opacity: pos.opacity, color, fontSize: 360, fontWeight: 800,
      lineHeight: 1, willChange: 'transform, opacity', pointerEvents: 'none',
    }}>{label}</div>
  );
  return <>
    {renderHero('md',   md,   '#1B4965')}
    {renderHero('html', html, '#C04A1A')}
  </>;
};

// ── Step 4: Main component — hero under NarrationStage, scene-local helpers managed separately ──
const App = () => (
  <NarrationStage timeline={TIMELINE} audioSrc="_narration/voiceover.mp3" width={1920} height={1080}>
    <HeroAnchor />  {/* ← persists across scenes, the full-film visual skeleton */}
    {/* Scene-local helpers use useSceneFade for soft fade in/out — never hard cuts */}
    <MdSideAux />
    <HtmlSideAux />
    {/* ... */}
  </NarrationStage>
);
```

**Full runnable reference**: `demos/md-html-narration/md-html-demo.html` (3min 21s, 7 segments, 21 cues, battle-tested)

### Rule 2 · No "Hard Cuts" Between Scenes

| Wrong pattern (PowerPoint slop) | Right pattern (cinematic) |
|---|---|
| Scene A whole `opacity 1→0` while scene B `opacity 0→1` | Scene A's core elements **morph into** B (smooth position/scale/color transition) |
| Each scene has its own layout; elements appear/disappear | Elements **persist on screen**, only position and form change |
| `keepMounted=false`, component unmounts the instant scenes switch | Hero uses `keepMounted=true`, sharing DOM nodes across scenes |
| Subtitle bars/data cards each fade in and out independently | The subtitle bar is the only "non-hero" entrance; after holding, it **exits with the hero's motion** |

Implementation:
- **Cross-scene shared elements** → lift hero to a direct child of `<NarrationStage>`, **not inside any `<Scene>`**
- Inside the hero, use `useNarration()` to read `time`, `scene`, `isCueTriggered` and decide its form from the current time
- `<Scene>` is only for helpers that exist solely in that segment (data cards, quote blocks, etc.), and **those helpers must not hard-cut either** — entrance uses expoOut + stagger; exit overlaps with the next segment's entrance via fade

### Rule 3 · Every Frame Must Have Motion

**Self-check**: grab **any random frame** during recording (not the second a cue fires).
- If the frame looks **completely static** → wrong. Go add base-layer motion (background drift / hero subtle scale / camera pan / parallax)
- Always have a **base-layer motion** running (even if it's not the focus):
  - hero element `scale: 1 ↔ 1.02` 5-second breathing loop
  - background `translateX: 0 ↔ -20px` slow drift
  - data cards retain micro `translateY` jitter after entering (Perlin noise)
- A perfectly still frame = PowerPoint slop

### Rule 4 · Easing / Stagger / Hold Are the Floor

| Item | Required | Forbidden |
|---|---|---|
| Easing | `expoOut` on main axis (`cubic-bezier(0.16, 1, 0.3, 1)`), `overshoot` for emphasis, `spring` for settling | `linear`, `ease`, CSS defaults |
| Multi-element entrance | 30ms stagger (each one 30ms later) | All in at once |
| Before a key cue | Hold 0.3-0.5s so viewers "see" it (previous segment's element holds still 0.3s, then cue fires) | One segment finishes, next starts seamlessly |
| Closing | Cut hard, last frame holds 1s | Fade to black |

See `animation-best-practices.md` §1-§4 for detailed rules.

### Self-check · First-Viewer Reaction

After you finish, show it to someone who hasn't seen it (or rewatch 24 hours later). What's their **first reaction**?

| Reaction | Rating | Action |
|---|---|---|
| "This is a PPT with voiceover" | Fail | Redo it |
| "The visuals switch with the audio" | Not passing | No continuous narrative; hero element missing or not threaded |
| "This thing moves" | Pass | But forgettable |
| "I want to keep watching" | Good | Pacing works |
| "I want to screenshot this segment" | Great | You did it |

---

## Workflow (High Level)

```
                ┌──────────────────────────┐
                │  Narration .md (## scene │
                │  + [[cue:xx]] markers)   │
                └──────────────┬───────────┘
                               │
                  narrate-pipeline.mjs
                               │
                               ▼
            ┌──────────────────────────────┐
            │ voiceover.mp3 (concatenated) │
            │ timeline.json (measured)     │
            └──────────────┬───────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌─────────────────┐      ┌──────────────────┐
    │ HTML animation  │      │ Record MP4 + mix │
    │ (NarrationStage)│      │ render-narration │
    │ Live audio sync │      │ → final MP4      │
    └─────────────────┘      └──────────────────┘
       Delivery form 1          Delivery form 2
```

## Narration Script Format

Place anywhere under the project directory; recommended filename `script.md`:

```markdown
---
title: What Is an LLM
voice: S_JSdgdWk22   # optional, overrides the default voice from .env
speed: 1.0           # optional, 0.5-2.0
gap: 0.4             # silence between segments in seconds, default 0.3
---

## intro
Hi everyone, today we'll explain LLMs in 5 minutes.

## what-is
LLM stands for Large Language Model. [[cue:bigmodel]]It is a neural network with hundreds of billions of parameters.
At its core, it's a next-token predictor for text.

## demo
For example, if you type "today's weather", [[cue:input]]the model predicts what the next character is most likely to be.
[[cue:predict]]Maybe "is great", maybe "is nice".
```

**Rules**:
- Segment heading `## scene-id` is English/digit + hyphen (e.g. `## what-is`, `## scene-1`)
- `[[cue:xx]]` is placed **in the middle of a key sentence** — the script splits the text at that point, and the moment right after the cue marker is the visual trigger
- The cue id is watched in the animation HTML via `<Cue id="xx">`
- When writing narration, **focus on rhythm + short sentences** — TTS flattens long sentences

## timeline.json Schema

```ts
{
  title: string,
  voice: string | null,
  speed: number,
  gap: number,
  totalDuration: number,        // measured duration of the full voiceover.mp3 in seconds
  voiceover: 'voiceover.mp3',   // path relative to timeline.json
  scenes: [
    {
      id: string,
      start: number,            // start time of this segment in the full track
      end: number,
      duration: number,
      audio: 'audio/<id>.mp3',  // this segment's standalone audio (sub-segments already concatenated)
      text: string,             // full segment text with [[cue:xx]] markers stripped
      // chunks is the source for subtitles — each chunk is a cue-split sub-segment with its TTS-measured window
      chunks: [
        {
          text: string,            // sub-segment text
          start: number,           // segment-relative time
          end: number,
          absoluteStart: number,   // absolute time on the full track (aligns with voiceover.mp3)
          absoluteEnd: number,
        }
      ],
      cues: [
        {
          id: string,
          offset: number,       // segment-relative time
          absoluteTime: number, // absolute time on the full timeline
        }
      ]
    }
  ]
}
```

`absoluteTime` and `absoluteStart/End` are **all actually measured** — the pipeline splits each segment's text at the cue boundaries, runs TTS on each sub-segment, and accumulates measured durations. **Not character-count linear estimates.**

## Subtitles

> **Subtitles are on by default** — long narrated videos without subtitles see a measurable drop in retention. NarrationStage ships `<Subtitles />` out of the box.

### Usage (one line)

```jsx
const { NarrationStage, Subtitles } = NarrationStageLib;
<NarrationStage timeline={TIMELINE} audioSrc="...">
  {/* your hero / scene content */}
  <Subtitles />  {/* ← auto-pulls active text from timeline.scenes[].chunks */}
</NarrationStage>
```

### Visual Rules (Bilibili style · anti-PowerPoint)

| Item | Rule | Anti-example |
|---|---|---|
| Background | **No background** (no black bar, no backdrop-blur) | Semi-transparent black + blur = subtitle bar smothers the frame = PPT vibe |
| Text color | **Dark ink `#1a1a1a` + white halo on light backgrounds**; white text + black halo on dark | White text + black outline on light backgrounds = blurry |
| Font size | 32px (1080p video) | <24px is unreadable, >40px hijacks the main visual |
| Font | `PingFang SC` / `Noto Sans SC` (sans-serif, Bilibili standard) | Serif fonts = looks like a movie subtitle |
| Position | bottom: 90px (not flush) | Flush bottom looks cheap |
| Line length | **≤ 12-13 characters** (mixed CN/EN counts English at 0.5 char) | >15 chars per line is unreadable on mobile |
| Line breaking | **Never break across periods**: split by `。！？` first, then merge clauses by `，、；：` to ≤maxLen | Hard char-count cuts that split "this is good" into "this is" + "good" |

`<Subtitles />` runs the rules above by default; no props needed. Dark scenes: `<Subtitles color="#fff" haloColor="rgba(0,0,0,0.85)" />`.

### Line-Breaking Algorithm (Already in narration_stage.jsx)

```js
splitChunkToLines(text, maxLen = 13)
// 1. Hard-punctuation split (。！？\n)
// 2. Sentences ≤ maxLen kept as-is
// 3. Otherwise split by weak punctuation (，、；：) and merge to ≤ maxLen
// 4. Fallback hard cut (rare)
// Mixed CN/EN: English/digits count as 0.5 visual width
```

If a line looks clearly too long or too short after chunking, **change the cue position in the narration script** (cue splits the segment more finely). Don't tweak the front-end line-break logic.

## NarrationStage API

```jsx
import 'assets/narration_stage.jsx';
const { NarrationStage, Scene, Cue, useNarration } = NarrationStageLib;

<NarrationStage
  timeline={TIMELINE}                  // contents of timeline.json
  audioSrc="_narration/voiceover.mp3"  // path relative to the current HTML
  width={1920} height={1080}
  background="#f5f1e8"
  controls={true}                      // show bottom playback bar in live mode
>
  {/* hero element: persists across scenes — direct child of NarrationStage */}
  <HeroAnchor />

  {/* scene-local helper: only appears in this segment */}
  <Scene id="intro">
    <Cue id="bigmodel">{(triggered, progress) => (
      <SomeElement style={{ opacity: progress }} />
    )}</Cue>
  </Scene>
</NarrationStage>
```

**Hooks**:
- `useNarration()` returns `{ time, scene, sceneTime, isCueTriggered, cueProgress }`
- Read directly in custom components; no props needed

**Scene component**:
- By default only mounts when `scene.id === id`
- Add `keepMounted` to mount continuously (use for cross-scene continuous animations)

**Cue component**:
- children must be `(triggered, progress) => ReactNode`
- progress is the 0→1 ramp after the cue fires (default 0.6s ramp)

## Time Source (Dual Track)

NarrationStage auto-detects `window.__recording`:
- **Live mode** (default): follows the audio element's currentTime; pause/seek by the user stays in sync
- **Recording mode** (render-video.js sets `window.__recording = true`): rAF wall-clock self-driven from 0, exposes `window.__seek(t)` for render-video.js to reset

## The Three Scripts

| Script | Input | Output |
|---|---|---|
| `scripts/tts-doubao.mjs` | single-segment text | one mp3 + measured duration |
| `scripts/narrate-pipeline.mjs` | narration .md | voiceover.mp3 + timeline.json |
| `scripts/mix-voiceover.sh` | video + voiceover.mp3 [+ BGM] | MP4 with audio |
| `scripts/render-narration.sh` | narration HTML + timeline.json | final MP4 (record + mix in one shot) |

## .env Configuration

`.env` in the skill root (gitignored):

```
DOUBAO_TTS_API_KEY=<your_key>
DOUBAO_TTS_VOICE_ID=<your_clone_voice_id>
DOUBAO_TTS_CLUSTER=volcano_icl
DOUBAO_TTS_ENDPOINT=https://openspeech.bytedance.com/api/v1/tts
```

See `.env.example` template. The Doubao voice clone ID is obtained from the Volcano Engine console.

## Standard Workflow (10 Steps)

1. **Write the narration**: the narration is the source code. Write the full voiceover, mark segment headings `## scene-id`, prepend `[[cue:xx]]` to key sentences
2. **Run narrate-pipeline**: `node scripts/narrate-pipeline.mjs --script script.md --out-dir _narration`
3. **Listen to the full voiceover.mp3**: if the pacing is off, rewrite. **This step sets the upper bound on the final quality.**
4. **🛑 Before designing, answer the ironclad rules**: what is the hero element? What's its state in each segment? How does it morph across scenes? If you can't answer, don't write code
5. **Write the animation HTML**: use NarrationStage + one or a few hero elements performing across scenes
6. **Live preview**: open the HTML in browser, hit ▶ Play, listen for visual + narration sync
7. **First-viewer self-check**: score with the "Self-check · First-Viewer Reaction" table above. If it fails, go back to Step 4
8. **Record video**: `bash scripts/render-narration.sh demo.html --timeline=_narration/timeline.json` (auto-records silent MP4 + mixes in voiceover)
9. **Optional BGM**: add `--bgm-mood=educational` to render-narration (or tech / tutorial etc.)
10. **Deliver**: browser HTML (for live demos) + final MP4 (for publishing)

## Troubleshooting

| Problem | Fix |
|---|---|
| TTS API error | Check `DOUBAO_TTS_API_KEY` in .env |
| A segment is noticeably longer/shorter than the script | The segment text has odd punctuation or emoji breaking TTS parsing → rewrite |
| cue absoluteTime is off | ffmpeg has a problem concatenating sub-segments → check mp3 encoding consistency |
| Black screen in recording | render-video.js never received the `window.__ready` signal → check NarrationStage mounts properly |
| Recording stutters | Heavy layout in the animation (lots of box-shadow / blur) → simplify or pre-composite |
| Live audio/video out of sync | audio element loads late → add `preload="auto"` or preload locally |

## When Not to Use This Pipeline

- **<60s short animations**: just make a silent animation + post-hoc dubbing (add-music.sh + one standalone TTS), no timeline driving needed
- **Pure BGM video**: use `add-music.sh` with a preset BGM
- **Human voiceover replacing TTS**: replace `voiceover.mp3` with the human recording; handwrite the timeline yourself or use ffprobe to measure segment durations + a helper script → the rest of the flow works the same

---

**One last reminder**: before writing code, return to the ironclad rules. **Don't make a PowerPoint with voiceover.**
