# Animations: Timeline Animation Engine

Read this when building animation / motion design HTML. Principles, usage, common patterns.

## Core Pattern: Stage + Sprite

Our animation system (`assets/animations.jsx`) provides a timeline-driven engine:

- **`<Stage>`**: container for the whole animation. Automatically provides auto-scale (fit viewport) + scrubber + play/pause/loop controls
- **`<Sprite start end>`**: a time slice. A Sprite is only visible from `start` to `end`. Inside, you can use the `useSprite()` hook to read your local progress `t` (0→1)
- **`useTime()`**: read the current global time (seconds)
- **`Easing.easeInOut` / `Easing.easeOut` / ...**: easing functions
- **`interpolate(t, from, to, easing?)`**: interpolate based on t

This pattern borrows from Remotion / After Effects, but stays lightweight and zero-dependency.

## Getting Started

```html
<script type="text/babel" src="animations.jsx"></script>
<script type="text/babel">
  const { Stage, Sprite, useTime, useSprite, Easing, interpolate } = window.Animations;

  function Title() {
    const { t } = useSprite();  // local progress 0→1
    const opacity = interpolate(t, [0, 1], [0, 1], Easing.easeOut);
    const y = interpolate(t, [0, 1], [40, 0], Easing.easeOut);
    return (
      <h1 style={{ 
        opacity, 
        transform: `translateY(${y}px)`,
        fontSize: 120,
        fontWeight: 900,
      }}>
        Hello.
      </h1>
    );
  }

  function Scene() {
    return (
      <Stage duration={10}>  {/* 10-second animation */}
        <Sprite start={0} end={3}>
          <Title />
        </Sprite>
        <Sprite start={2} end={5}>
          <SubTitle />
        </Sprite>
        {/* ... */}
      </Stage>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<Scene />);
</script>
```

## Common Animation Patterns

### 1. Fade In / Fade Out

```jsx
function FadeIn({ children }) {
  const { t } = useSprite();
  const opacity = interpolate(t, [0, 0.3], [0, 1], Easing.easeOut);
  return <div style={{ opacity }}>{children}</div>;
}
```

**Note the range**: `[0, 0.3]` means the fade-in completes in the first 30% of the sprite's time, then opacity stays at 1.

### 2. Slide In

```jsx
function SlideIn({ children, from = 'left' }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, 0.4], [0, 1], Easing.easeOut);
  const offset = (1 - progress) * 100;
  const directions = {
    left: `translateX(-${offset}px)`,
    right: `translateX(${offset}px)`,
    top: `translateY(-${offset}px)`,
    bottom: `translateY(${offset}px)`,
  };
  return (
    <div style={{
      transform: directions[from],
      opacity: progress,
    }}>
      {children}
    </div>
  );
}
```

### 3. Character-by-character Typewriter

```jsx
function Typewriter({ text }) {
  const { t } = useSprite();
  const charCount = Math.floor(text.length * Math.min(t * 2, 1));
  return <span>{text.slice(0, charCount)}</span>;
}
```

### 4. Number Count-up

```jsx
function CountUp({ from = 0, to = 100, duration = 0.6 }) {
  const { t } = useSprite();
  const progress = interpolate(t, [0, duration], [0, 1], Easing.easeOut);
  const value = Math.floor(from + (to - from) * progress);
  return <span>{value.toLocaleString()}</span>;
}
```

### 5. Segmented Explanation (typical instructional animation)

```jsx
function Scene() {
  return (
    <Stage duration={20}>
      {/* Phase 1: show the problem */}
      <Sprite start={0} end={4}>
        <Problem />
      </Sprite>

      {/* Phase 2: show the approach */}
      <Sprite start={4} end={10}>
        <Approach />
      </Sprite>

      {/* Phase 3: show the result */}
      <Sprite start={10} end={16}>
        <Result />
      </Sprite>

      {/* Caption visible throughout */}
      <Sprite start={0} end={20}>
        <Caption />
      </Sprite>
    </Stage>
  );
}
```

## Easing Functions

Preset easing curves:

| Easing | Character | Use for |
|--------|-----------|---------|
| `linear` | constant velocity | scrolling captions, continuous animation |
| `easeIn` | slow→fast | exits / disappearing |
| `easeOut` | fast→slow | entrances / appearing |
| `easeInOut` | slow→fast→slow | position changes |
| **`expoOut`** ⭐ | **exponential ease-out** | **Anthropic-grade primary easing** (physical weight) |
| **`overshoot`** ⭐ | **elastic overshoot** | **Toggles / button pops / emphasis interactions** |
| `spring` | spring | interactive feedback, geometric settling |
| `anticipation` | reverse first, then forward | emphasized actions |

**Default primary easing is `expoOut`** (not `easeOut`) — see `animation-best-practices.md` §2.
Entrance with `expoOut`, exit with `easeIn`, toggle with `overshoot` — the foundational rules for Anthropic-grade animation.

## Pacing and Duration Guide

### Micro-interactions (0.1–0.3s)
- Button hover
- Card expand
- Tooltip appear

### UI transitions (0.3–0.8s)
- Page switch
- Modal appear
- List item insertion

### Narrative animation (2–10s per segment)
- One phase of a concept explanation
- A data chart reveal
- A scene transition

### A single narrative animation segment must not exceed 10 seconds
Human attention is finite. Tell one thing in 10 seconds, then move to the next.

## How to Think About Designing an Animation

### 1. Content/story first, animation second

**Wrong**: decide you want a fancy animation, then stuff content into it
**Right**: first figure out what information you need to convey, then use animation to serve that information

Animation is a **signal**, not **decoration**. A fade-in says "this is important, look here" — if everything fades in, the signal dies.

### 2. Plan the timeline by Scene

```
0:00 - 0:03   problem appears (fade in)
0:03 - 0:06   problem zooms / unfolds (zoom+pan)
0:06 - 0:09   solution appears (slide in from right)
0:09 - 0:12   solution explained (typewriter)
0:12 - 0:15   result demo (counter up + chart reveal)
0:15 - 0:18   one-line summary (static, read for 3s)
0:18 - 0:20   CTA or fade out
```

Write the timeline first, then write components.

### 3. Assets first

The images / icons / fonts the animation needs should be ready **before** you start. Don't draw halfway then hunt for assets — that breaks rhythm.

## Common Issues

**Animation stutters**
→ Mostly layout thrashing. Use `transform` and `opacity`, don't animate `top`/`left`/`width`/`height`/`margin`. Browsers GPU-accelerate `transform`.

**Animation too fast, can't read**
→ Reading one Chinese character takes 100–150ms; a word 300–500ms. If you're telling a story with text, allow at least 3 seconds per sentence.

**Animation too slow, audience bored**
→ Interesting visual change must be dense. A static frame longer than 5 seconds gets dull.

**Multiple animations interfering**
→ Use CSS `will-change: transform` to tell the browser this element will move, reducing reflow.

**Recording as video**
→ Use the skill's built-in toolchain (one command outputs three formats): see `video-export.md`
- `scripts/render-video.js` — HTML → 25fps MP4 (Playwright + ffmpeg)
- `scripts/convert-formats.sh` — 25fps MP4 → 60fps MP4 + optimized GIF
- Want more precise frame rendering? Make render(t) a pure function — see `animation-pitfalls.md` §5

## Working with Video Tools

This skill makes **HTML animation** (running in the browser). If the final deliverable is video footage:

- **Short animation / concept demo**: use the methods here for HTML animation → screen recording
- **Long-form video / narrative**: this skill focuses on HTML animation; for long videos use AI-video-generation skills or professional video software
- **Motion graphics**: professional After Effects / Motion Canvas is more appropriate

## On Popmotion and Similar Libraries

If you genuinely need physics animation (spring, decay, keyframes with precise timing) and our engine can't handle it, fall back to Popmotion:

```html
<script src="https://unpkg.com/popmotion@11.0.5/dist/popmotion.min.js"></script>
```

But **try our engine first**. It's enough 90% of the time.
