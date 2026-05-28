# Cinematic Patterns · Best Practices for Workflow Demos

> 5 key patterns for upgrading from "PowerPoint animation" to "keynote-grade cinematic."
> Distilled from the two cinematic demos in the 2026-04 "let's talk skill" deck (Nuwa workflow + Darwin workflow). Reproducible in practice.

---

## 0 · What this document solves

When you need to make a "demo animation showing a workflow" (typical scenarios: skill workflows, product onboarding, API call flows, agent task execution), there are two common approaches:

| Paradigm | What it looks like | Outcome |
|---|---|---|
| **PowerPoint animation** (bad) | step 1 fade in → step 2 fade in → step 3 fade in, 4 boxes laid out on the same screen | Audience feels "this is just a PowerPoint with fade effects," no wow moment |
| **Cinematic** (good) | scene-based, focus on one thing at a time, transitions between scenes are dissolve / focus pull / morph | Audience feels "this is a product keynote clip," they want to screenshot and share |

The root of the difference is **not animation technique**, it's **narrative paradigm**. This document explains how to upgrade from the former to the latter.

---

## 1 · Five core patterns

### Pattern A · Dashboard + Cinematic Overlay two-layer structure

**Problem**: a pure cinematic defaults to a black screen + a ▶ button. If the user flips to the page and doesn't click, they see nothing.

**Solution**:
```
DEFAULT state (always visible): full static workflow dashboard
  └── audience sees at a glance how this skill / workflow runs

POINT ▶ trigger (overlay floats up): 22-second cinematic
  └── after it finishes, fade back to DEFAULT automatically

```

**Implementation points**:
- `.dash` is visible by default, `.cinema` defaults to `opacity: 0; pointer-events: none`
- `.play-cta` is a small gold button in the bottom-right (not a central full-screen overlay)
- Click → `cinema.classList.add('show')` + `dash.classList.add('hide')`
- Use `requestAnimationFrame` running once (not looped); when finished, `endCinematic()` reverses state

**Anti-pattern**: default = central large ▶ overlay covering everything, page is blank until clicked.

---

### Pattern B · Scene-based, NOT Step-based

**Problem**: breaking the animation into "step 1 shows → step 2 shows → ..." is PowerPoint thinking.

**Solution**: break into 5 scenes; each scene is an **independent shot**, full-screen, focused on one thing:

| Scene type | Job | Duration |
|---|---|---|
| 1 · Invoke | user input trigger (terminal typewriter) | 3–4s |
| 2 · Process | visualization of the core workflow (distinctive visual language) | 5–6s |
| 3 · Result/Insight | the key distilled output (visualized) | 4–5s |
| 4 · Output | actual deliverable shown (file / diff / numbers) | 3–4s |
| 5 · Hero Reveal | closing hero moment (large type + value proposition) | 4–5s |

**Total ≈ 22 seconds** — this is the tested golden length:
- shorter than 18s: PMs haven't gotten into it before it ends
- longer than 25s: they lose patience
- 22s is just right to "hook → unfold → resolve → leave an impression"

**Implementation points**:
- `T = { DURATION: 22.0, s1_in: [0, 0.7], s2_in: [3.8, 4.6], ... }` — a global timeline
- A single `requestAnimationFrame(render)` drives opacity / transform calculations across all scenes
- Don't use setTimeout chains (easy to break, hard to debug)
- Easing must use `expoOut` / `easeOut` / cubic-bezier — **linear is forbidden**

---

### Pattern C · Each demo's visual language must be unique

**Problem**: after finishing the first cinematic, you get lazy on the second and reuse the same template (same orbit + pentagon + typewriter + hero large type), only swapping the copy.

**Consequence**: the audience notices the two skills "look identical" — effectively telling them "these two skills are no different."

**Solution**: each workflow's core metaphor is different, so its visual language must be different too.

**Comparison case study**:

| Dimension | Nuwa (distilling a person) | Darwin (optimizing a skill) |
|---|---|---|
| Core metaphor | collect → refine → write | loop → evaluate → ratchet |
| Visual motion | float / radiate / pentagon | loop / ascend / contrast |
| Scene 2 | 3D Orbit · 8 archive items floating on a perspective ellipse | Spin Loop · token runs 5 laps along a 6-node ring |
| Scene 3 | Pentagon · 5 tokens radiating from center | v1 vs v5 · side-by-side diff (red version vs gold version) |
| Scene 4 | SKILL.md typewriter | Hill-Climb · full-screen curve drawing |
| Scene 5 hero | "21 minutes" serif italic large type | rotating gear ⚙ + "KEPT +1.1" gold tag |

**Test**: cover the copy, look only at the visuals — can you tell which demo this is? If not, that's laziness.

---

### Pattern D · Use AI-generated real assets, don't use emoji or hand-drawn SVG

**Problem**: in a 3D orbit / gallery, you need asset fragments floating around. Emoji (📚🎤) are ugly and off-brand; hand-drawn SVG book spines never look like real books.

**Solution**: use `huashu-gpt-image` to render a single 4×2 grid image (8 themed objects · white background · 60px breathing space · unified style), then `extract_grid.py --mode bbox` to cut them into 8 separate transparent PNGs.

**Prompt essentials** (detailed prompt patterns are in the `huashu-gpt-image` skill):
- IP anchoring ("1960s Caltech archive aesthetic" / "Hearthstone-style consistent treatment")
- White background (easier to cut out; gray backgrounds give atmosphere but make transparency hard)
- 4×2 not 5×5 (avoid last-row compression bug)
- Persona finishing ("You are a Wired magazine curator preparing an exhibition photo")

**Anti-pattern**: using emoji as icons, using CSS silhouettes as product images.

---

### Pattern E · BGM + SFX dual-track

**Problem**: animation without sound — the audience subconsciously feels "this thing looks like a cheap demo."

**Solution**: BGM long tone + 11 SFX cues.

**Generic SFX cue recipe** (suitable for workflow demos):

| Timestamp | SFX | Trigger scene |
|---|---|---|
| 0.10s | whoosh | terminal rises from below |
| 3.0s | enter | typewriter finishes, press enter |
| 4.0s | slide-in | scene 2 element enters |
| 5–9s × 5 | sparkle | key process nodes (each generation / each token / each data point) |
| 14s | click | switch to output scene |
| 17.8s | logo-reveal | the hero reveal moment |
| typewriter | type | trigger every 2 characters (don't go too dense) |

**Frequency separation**: BGM volume 0.32 (low-frequency floor), SFX volume 0.55 (mid-high punch), sparkle 0.7 (needs to pop), logo-reveal 0.85 (strongest hero moment).

**User control**:
- Must have a ▶ start overlay (browser autoplay restriction)
- Small mute button in the top-right (user can mute anytime)
- Don't make it "force-play the moment you flip to this page"

---

## 2 · Static Dashboard Design Essentials

The dashboard is Layer 1 of the two-layer structure — the PM understands the skill without clicking ▶.

**Layout**: 3-column grid (or 1 large + 2 small); each panel solves one question:

| Panel type | Solves what | Case |
|---|---|---|
| **Pipeline / Flow Diagram** | "What's the workflow of this skill?" | Nuwa 4-stage pipeline · Darwin autoresearch loop |
| **Snapshot / State** | "What does the real data output look like?" | Darwin 8-dimension rubric snapshot |
| **Trajectory / Evolution** | "How does it change after multiple runs?" | Darwin 5-generation hill-climb curve |
| **Examples / Gallery** | "What's already been produced?" | Nuwa 21 personas gallery |
| **Strip · Example I/O** | "What goes in → what comes out" | Nuwa example strip: `› nuwa distill feynman → feynman.skill (21 min)` |

**Key constraints**:
- Information density must be sufficient (each panel must carry differentiated information)
- But don't pad with data slop (every number must mean something)
- Color palette consistent with the cinematic (same color system, smooth switching)

---

## 3 · Debugging and dev tools

Any long animation must ship three dev tools, or debugging will explode.

### Tool 1 · `?seek=N` freezes at second N

```js
const seek = parseFloat(params.get('seek'));
if (!isNaN(seek)) {
  started = true; muted = true;
  frozenT = seek;  // render() uses this t instead of elapsed
  cinema.classList.add('show'); dash.classList.add('hide');
}

// inside render():
let t = frozenT !== null ? frozenT : (elapsed % T.DURATION);
```

Usage: `http://.../slide.html?seek=12` jumps directly to the frame at second 12, no waiting.

### Tool 2 · `?autoplay=1` skips the ▶ overlay

Convenient for playwright auto-screenshot tests, and for force-starting when embedded in iframes.

### Tool 3 · Manual REPLAY button

Small button in the top-right; user / dev can replay any number of times. CSS:

```css
.replay{position:absolute;top:18px;right:18px;background:rgba(212,165,116,0.1);
  border:1px solid rgba(212,165,116,0.3);color:#D4A574;
  font-family:monospace;font-size:10px;letter-spacing:.28em;text-transform:uppercase;
  padding:6px 12px;border-radius:1px;cursor:pointer;backdrop-filter:blur(6px);z-index:6}
```

---

## 4 · iframe embedding pitfalls (if the cinematic is embedded in a deck)

### Pitfall 1 · The parent window's click zone intercepts buttons inside the iframe

If the deck index.html adds "left/right 22vw transparent click zones for paging," they **cover the ▶ play button inside the iframe** — the user clicks the button and it gets swallowed as "next page."

**Fix**: give the click zones `top: 12vh; bottom: 25vh`, leaving 25% top/bottom uncovered so the iframe's central ▶ and bottom-right ▶ are both clickable.

### Pitfall 2 · Keyboard events lost after iframe steals focus

After the user clicks the iframe, focus is in the iframe; the parent window's ←/→ keyboard events stop firing.

**Fix**:
```js
iframe.addEventListener('load', () => {
  // inject keyboard forwarder
  const doc = iframe.contentDocument;
  doc.addEventListener('keydown', (e) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: e.key, ... }));
  });
  // after click, pull focus back to parent window
  doc.addEventListener('click', () => setTimeout(() => window.focus(), 0));
});
```

### Pitfall 3 · file:// vs https:// behavior differences

A cinematic that tests fine locally on file:// can break after deployment because:
- under file:// the iframe contentDocument is same-origin
- under https:// it's also same-origin (if same host), but audio autoplay restrictions are stricter

**Fix**:
- Before deploying, test once over local HTTP with `python3 -m http.server`
- BGM must wait until the user clicks ▶ before `bgm.play()` — don't try to play on page load

---

## 5 · Anti-pattern quick reference

| ❌ Anti-pattern | ✅ Right pattern |
|---|---|
| Default = black screen ▶ overlay | Default = static dashboard, ▶ is auxiliary |
| 4 steps side by side fading in on one screen | 5 scenes full-screen switching, each focused on one thing |
| Reusing the same template with new copy for different demos | Each demo has its own visual language (distinguishable with copy hidden) |
| Emoji / hand-drawn SVG as assets | gpt-image-2 grid + extract_grid cutout |
| No BGM, no SFX | BGM + 11 SFX cues dual-track |
| setTimeout chain to schedule | requestAnimationFrame + global timeline T object |
| linear easing | Expo / cubic-bezier easing |
| No dev tools | `?seek=N` + `?autoplay=1` + REPLAY button |
| Buttons in iframe swallowed by parent click zone | Add top/bottom margin to click zones to make room for buttons |

---

## 6 · Time budget

Following this pattern, a complete cinematic demo (with dashboard):

| Task | Time |
|---|---|
| Design 5-scene narrative + visual language | 30 min (be deliberate — determines uniqueness) |
| Dashboard static layout + content | 1 hour |
| Cinematic 5 scenes implementation | 1.5 hours |
| Audio cues timing + replay button | 30 min |
| Playwright screenshot verification of 5 key moments | 15 min |
| **Total per demo** | **3–4 hours** |

A second demo reuses the framework but **its visual language must be unique** — about 2–3 hours.
