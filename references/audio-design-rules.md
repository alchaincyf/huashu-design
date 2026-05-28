# Audio Design Rules · huashu-design

> The audio recipe for every animation demo. Pairs with `sfx-library.md` (asset inventory).
> Forged in practice: huashu-design release hero v1-v9 iterations · deep Gemini audio teardown of Anthropic's three official films · 8000+ A/B comparisons

---

## Core Principle · The Dual-Track Audio Doctrine (ironclad rule)

Animation audio **must be designed as two independent layers**; you cannot do just one:

| Layer | Role | Time scale | Relation to visuals | Frequency band |
|---|---|---|---|---|
| **SFX (beat layer)** | Marks each visual beat | 0.2-2s short bursts | **Strong sync** (frame-aligned) | **High freq 800Hz+** |
| **BGM (ambience floor)** | Emotional bed, soundstage | Continuous 20-60s | Weak sync (segment-level) | **Mid/low freq <4kHz** |

**An animation with only BGM is crippled** — viewers subconsciously sense that "the visuals move but nothing responds to them"; this is the root of the "cheap" feeling.

---

## Gold Standard · Golden Ratio

These numbers come from A/B testing Anthropic's three official films + our own v9 lock-in — **hard engineering parameters**, drop them in directly:

### Volume
- **BGM volume**: `0.40-0.50` (relative to full scale 1.0)
- **SFX volume**: `1.00`
- **Loudness gap**: BGM peak is **-6 to -8 dB below SFX peak** (SFX doesn't pop because of absolute volume — it pops because of the gap)
- **amix parameter**: `normalize=0` (never `normalize=1` — it flattens dynamic range)

### Frequency Isolation (P1 hard optimization)
Anthropic's secret isn't "louder SFX", it's **frequency stratification**:

```bash
[bgm_raw]lowpass=f=4000[bgm]      # BGM constrained to <4kHz mid/low
[sfx_raw]highpass=f=800[sfx]      # SFX pushed to 800Hz+ mid/high
[bgm][sfx]amix=inputs=2:duration=first:normalize=0[a]
```

Why: the human ear is most sensitive in the 2-5kHz range (the "presence" band). If SFX lives entirely in that range and BGM covers the full spectrum, **the SFX gets masked by the BGM's high-frequency content**. Lowpass pushes BGM down, highpass pushes SFX up; they occupy different spectral neighborhoods, and SFX clarity jumps a tier.

### Fade
- BGM in: `afade=in:st=0:d=0.3` (0.3s, no hard cut)
- BGM out: `afade=out:st=N-1.5:d=1.5` (1.5s long tail, sense of closure)
- SFX have built-in envelopes; no extra fade needed

---

## SFX Cue Design Rules

### Density (How Many SFX per 10s)
Measured SFX densities across Anthropic's three films fall in three tiers:

| Film | SFX per 10s | Product personality | Scene |
|---|---|---|---|
| Artifacts (ref-1) | **~9 per 10s** | Feature-dense, info-heavy | Complex tool demo |
| Code Desktop (ref-2) | **0** | Pure ambience, meditative | Dev tool focus state |
| Word (ref-3) | **~4 per 10s** | Balanced, office pacing | Productivity tool |

**Heuristic**:
- Calm/focused product personality → low SFX density (0-3 per 10s), BGM-led
- Lively/info-dense product personality → high SFX density (6-9 per 10s), SFX-driven pacing
- **Don't fill every visual beat** — whitespace beats density. **Deleting 30-50% of cues makes the rest more dramatic.**

### Cue Selection Priority
Not every visual beat needs SFX. Pick by priority:

**P0 mandatory** (omission feels wrong):
- Typing (terminal/input)
- Click/select (user decision moments)
- Focus shift (visual hero handoff)
- Logo reveal (brand closure)

**P1 recommended**:
- Element enter/exit (modal / card)
- Completion/success feedback
- AI generation start/end
- Major transitions (scene change)

**P2 optional** (too many gets noisy):
- hover / focus-in
- Progress tick
- Decorative ambient

### Timestamp Alignment Precision
- **Same-frame alignment** (0ms error): click / focus shift / logo settle
- **Lead by 1-2 frames** (-33ms): quick whooshes (give viewers psychological anticipation)
- **Lag by 1-2 frames** (+33ms): object landing / impact (matches real physics)

---

## BGM Decision Tree

The huashu-design skill ships 6 BGM tracks (`assets/bgm-*.mp3`):

```
What is the animation's personality?
├─ Product launch / tech demo → bgm-tech.mp3 (minimal synth + piano)
├─ Tutorial / tool walkthrough → bgm-tutorial.mp3 (warm, instructional)
├─ Educational / explainer → bgm-educational.mp3 (curious, thoughtful)
├─ Marketing ad / brand promo → bgm-ad.mp3 (upbeat, promotional)
└─ Same style needing a variant → bgm-*-alt.mp3 (the sibling alternative)
```

### Scenarios Without BGM (worth considering)
See Anthropic Code Desktop (ref-2): **0 SFX + pure Lo-fi BGM** also lands at premium.

**When to skip BGM**:
- Animation duration <10s (BGM can't establish)
- Product personality is "focus/meditation"
- Scene already has ambient sound / narration
- SFX density is very high (avoid auditory overload)

---

## Scene Recipes (Out of the Box)

### Recipe A · Product Launch Hero (huashu-design v9 style)
```
Duration: 25s
BGM: bgm-tech.mp3 · 45% · band <4kHz
SFX density: ~6 per 10s

cues:
  terminal type → type × 4 (0.6s interval)
  enter        → enter
  card cluster → card × 4 (staggered 0.2s)
  select       → click
  Ripple       → whoosh
  4× focus     → focus × 4
  Logo         → thud (1.5s)

Volume: BGM 0.45 / SFX 1.0 · amix normalize=0
```

### Recipe B · Tool Feature Demo (cf. Anthropic Code Desktop)
```
Duration: 30-45s
BGM: bgm-tutorial.mp3 · 50%
SFX density: 0-2 per 10s (minimal)

Strategy: let BGM + voiceover narration drive; SFX only at **decisive moments** (file save / command finished)
```

### Recipe C · AI Generation Demo
```
Duration: 15-20s
BGM: bgm-tech.mp3 or no BGM
SFX density: ~8 per 10s (high density)

cues:
  user input → type + enter
  AI starts processing → magic/ai-process (1.2s loop)
  generation done → feedback/complete-done
  result reveal → magic/sparkle

Tip: ai-process can loop 2-3× through the whole generation phase
```

### Recipe D · Pure Ambience Long Take (cf. Artifacts)
```
Duration: 10-15s
BGM: none
SFX: 3-5 carefully designed cues used standalone

Strategy: every SFX is hero; no "BGM blur" problem.
Best for: single-product slow takes, close-up showcases
```

---

## ffmpeg Composition Templates

### Template 1 · Single SFX overlay onto video
```bash
ffmpeg -y -i video.mp4 -itsoffset 2.5 -i sfx.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:normalize=0[a]" \
  -map 0:v -map "[a]" output.mp4
```

### Template 2 · Multi-SFX timeline composition (cue-aligned)
```bash
ffmpeg -y \
  -i sfx-type.mp3 -i sfx-enter.mp3 -i sfx-click.mp3 -i sfx-thud.mp3 \
  -filter_complex "\
[0:a]adelay=1100|1100[a0];\
[1:a]adelay=3200|3200[a1];\
[2:a]adelay=7000|7000[a2];\
[3:a]adelay=21800|21800[a3];\
[a0][a1][a2][a3]amix=inputs=4:duration=longest:normalize=0[mixed]" \
  -map "[mixed]" -t 25 sfx-track.mp3
```
**Key parameters**:
- `adelay=N|N`: first value is left channel delay (ms), second is right; write both to keep stereo aligned
- `normalize=0`: preserves dynamic range — critical!
- `-t 25`: cap at the specified duration

### Template 3 · Video + SFX track + BGM (with frequency isolation)
```bash
ffmpeg -y -i video.mp4 -i sfx-track.mp3 -i bgm.mp3 \
  -filter_complex "\
[2:a]atrim=0:25,afade=in:st=0:d=0.3,afade=out:st=23.5:d=1.5,\
     lowpass=f=4000,volume=0.45[bgm];\
[1:a]highpass=f=800,volume=1.0[sfx];\
[bgm][sfx]amix=inputs=2:duration=first:normalize=0[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k final.mp4
```

---

## Failure Mode Cheat Sheet

| Symptom | Root cause | Fix |
|---|---|---|
| SFX inaudible | BGM high-frequency content masks it | Add `lowpass=f=4000` on BGM + `highpass=f=800` on SFX |
| SFX too loud / harsh | SFX absolute volume too high | Drop SFX to 0.7, BGM to 0.3, keep the gap |
| BGM and SFX fight on rhythm | Wrong BGM (one with a strong beat) | Swap to ambient / minimal synth BGM |
| BGM cuts off abruptly at end | No fade-out | `afade=out:st=N-1.5:d=1.5` |
| SFX overlap into mush | Cues too dense + each SFX too long | Keep SFX ≤ 0.5s, cue spacing ≥ 0.2s |
| WeChat MP4 has no audio | WeChat sometimes mutes autoplay | Don't worry; users get audio when they tap; GIFs are silent by design |

---

## Coupling with Visuals (advanced)

### SFX Timbre Must Match the Visual Style
- Warm beige / paper visuals → SFX in **wood/soft** timbre (Morse, paper snap, soft click)
- Cool dark-tech visuals → SFX in **metal/digital** timbre (beep, pulse, glitch)
- Hand-drawn / childlike visuals → SFX in **cartoon/exaggerated** timbre (boing, pop, zap)

The current `apple-gallery-showcase.md` warm beige base → pairs with `keyboard/type.mp3` (mechanical) + `container/card-snap.mp3` (soft) + `impact/logo-reveal-v2.mp3` (cinematic bass)

### SFX Can Lead Visual Pacing
Advanced technique: **design the SFX timeline first, then adjust the visual animation to align with the SFX** (not the other way around).
Because every SFX cue is a "clock tick", aligning visuals to SFX rhythm is rock-solid — the inverse (SFX chasing visuals) often misses by ±1 frame and feels wrong.

---

## QC Checklist (pre-release self-check)

- [ ] Loudness gap: SFX peak - BGM peak = -6 to -8 dB?
- [ ] Bands: BGM lowpass 4kHz + SFX highpass 800Hz?
- [ ] amix normalize=0 (preserves dynamic range)?
- [ ] BGM fade-in 0.3s + fade-out 1.5s?
- [ ] SFX count appropriate (density per scene personality)?
- [ ] Each SFX frame-aligned with its visual beat (within ±1 frame)?
- [ ] Logo reveal SFX long enough (1.5s recommended)?
- [ ] Listen with BGM muted: does the SFX alone have rhythm?
- [ ] Listen with SFX muted: does the BGM alone have emotional arc?

Both layers should stand on their own. If it only sounds good when stacked, you haven't designed them properly.

---

## References

- SFX asset inventory: `sfx-library.md`
- Visual style reference: `apple-gallery-showcase.md`
- Deep audio analysis of Anthropic's three films (the original author's research notes — not bundled with this skill)
- huashu-design v9 case study video (the original author's reference recording — not bundled with this skill)
