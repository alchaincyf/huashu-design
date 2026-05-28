# Launch Film Workflow: Write the 10k-Char Director's Notes First, Then Animate

> Standard workflow for high-spec visual work (≥ 20 seconds, with brand narrative, with slogan reveal, likely promoted on X / WeChat / Bilibili).
>
> Trigger condition: the task is "product-upgrade promo / brand launch film / launch trailer / Super-Bowl-tier ad / brand campaign / hero animation video", **and the user has stated clear quality expectations** (e.g. "Super-Bowl quality", "10x detail", "Apple-level").
>
> Anti-trigger: do not run this workflow on "quick animation demo", "simple motion graphic", or "single-icon animation" — it'll over-engineer.

---

## 1. Why write director's notes first

Hard lesson (2026-05-11 huashu-md-html v2.0 project):

Round 1 jumped straight to HTML. The output was a "programmer-perspective animation" — every capability got equal weight, the pacing was uniform, the slogans collided with each other, and there was no narrative arc.
Round 2 took the user's instruction "stop — write a 10,000-character storyboard from an Apple-director perspective first", produced v5-director-notes.md (11,500 chars, 13-shot shot-by-shot spec), then implemented from the script — one pass, every paused frame held up, pacing had peaks and a real climax.

**Core difference**: writing the script is *think*; writing HTML is *execute*. Think fully first and execute becomes mechanical translation. Execute first and every shot is an in-the-moment decision — guaranteed chaos.

Writing director's notes isn't "posturing" — it's settling every visual decision into a document **before you touch code**. Every shot has already been visualized in your head, reasoned through, traced against context. When implementing HTML, no creative decisions are left — only faithful translation.

---

## 2. Trigger judgement (ask yourself 3 questions first)

Before launching the launch-film workflow:

1. **Does this film carry brand narrative?** (a thesis / slogan reveal / upgrade ritual feel) — yes → run the director's-notes flow
2. **Will the audience pause to look?** (might screenshot, make an X poster, make a cover, watch in slow review) — yes → every frame must hold up
3. **Does the client/user have an "I want it like XXX" reference?** (Apple / Anthropic / Nike / Penguin / some director) — yes → the visual context must be explicit

Any one yes → run the flow. All three no → skip; use the standard flow in [animations.md](animations.md).

---

## 3. The 5-Part Structure of Director's Notes

A 10k-character (10,000–12,000 chars in Chinese, equivalent in English) director's notes must contain these 5 parts. **Any missing part = incomplete, and quality will suffer**.

### Part I · Director's Statement (~1500–2000 chars)

Answer 5 questions:

1. **What is this film NOT?** (Explicit exclusions — "this is not a feature-explainer", "not a demo")
2. **The core thesis in one line** — if the audience remembers only one sentence after watching, which one is it?
3. **What context are you in dialogue with?** — list 5–8 visual references (director / designer / brand / cinematographer / work-title + year), explaining what you learned from each
4. **Three audience personas + a promise to each**: primary / secondary / outer audience, one paragraph each
5. **Pacing philosophy** — the slow / accelerate / peak / settle curve + which second the emotional climax lands on (**not necessarily the last second**)

End with an anti-slop checklist: **things this film will NOT do** (concrete, not vague).

### Part II · Visual System (~1500–2500 chars)

This is the engineered visual spec. Once it's complete, any executor can deliver a consistent visual from it.

Required subsections:

- **Full palette**: at least 8–10 colors, each with HEX + functional definition + max screen-share
- **Type system**: at least 6 size tiers, each with font name + weight + size + letter-spacing + usage
- **Grid system**: canvas size + outer margin + column grid + baseline grid + key safe areas + golden-section anchors
- **Animation system**: easing library (≤ 4) + duration dictionary + stagger rules + scene-transition rules
- **Chrome elements**: small persistent details (counter / chip / ticker / watermark / texture), each with position + in/out timing
- **Audio system**: 30-second BGM curve (with layers) + SFX dictionary (10+ cues with timecodes + volume + frequency-band isolation)
- **Anti-AI-slop checklist**: per-shot self-check (10–15 items)

Ironclad rule: **every visual decision derives from the Visual System; don't invent new values inside the shot list**.

### Part III · Story Arc (~500–800 chars)

Three-act structure + emotion curve:

- **Act I · SETUP** (0 → first 1/5 of runtime, e.g. 0–6s for 30s): audience enters, the problem is posed
- **Act II · ESCALATION** (middle 2/3): the answer unfolds, theme accumulates
- **Act III · PAYOFF** (last 1/4): elevation, slogan reveal, brand stamp

Include an ASCII emotion curve + marked emotional-climax moment.

**Critical decision**: the climax is NOT necessarily at the end. For 30s films the climax is usually at 22–25s (not 29s) — the last few seconds are resolution / decay, not peak. Violate this and you guarantee a "strong start, weak finish" feel.

### Part IV · Shot-by-Shot Storyboard (~5000–7000 chars · 60% of the document)

Each shot needs 10 fields (none optional):

```
SHOT NN · NAME
[TIMECODE]    start–end + duration
[FUNCTION]    this shot's function in the story arc (one sentence)
[VISUAL]      composition + element positions + motion direction
[TYPE]        typography spec (font / size / tracking / line-height / color / alignment)
[ANIM]        per-element in/out timing + easing + duration + stagger + delay
[AUDIO]       music beat + SFX cue (BGM beat per shot + a must-include SFX schedule)
[CHROME]      corner-element states (which chrome is on / which fades in/out / which pulses)
[ANTI-SLOP]   which self-check items this shot passes + the 120% detail signature
[WHY]         logic carrying over from previous shot + hook leading to the next
```

**Fields average 30–80 chars → 400–700 chars per shot → 12–15 shots → 5000–7000 chars**.

Real-world tip: after writing the storyboard, **read it through yourself** — delete any one shot, does the whole film still stand? If yes, that shot is redundant — delete it.

### Part V · Production Manifest (~800–1200 chars)

Engineering deliverables checklist:

- Font loading URLs (with preconnect)
- CSS variables (paste-ready)
- BGM source-selection criteria + Suno/Udio prompt keywords + alternate library
- SFX dictionary (cue-by-cue file path + volume per timecode)
- **Keyframe verification plan**: 12–15 pause-and-check keyframe timecodes, each with checklist items (fonts / positions / chrome state)
- Recording parameters (fps / codec / bitrate / preset)
- ffmpeg audio mix command (with audio-stream verification)
- Deliverables list (mp4 / mp4-60fps / gif / poster.png / silent.mp4 / shot-list.csv)
- End-to-end time estimate (hour precision)

---

## 4. 5 Tips for Writing Director's Notes

**4.1 Use a director's voice, not a PM's voice**

Bad: "This shot displays the product features."
Good: "This is the hero shot — if the audience pauses anywhere, I want it to be here."

Director's notes are written for the executor, but also for your future self. First-person + judgment leaves more decision trace than description.

**4.2 Cite specific works (with year), not just school names**

Bad: "Apple-inspired"
Good: "Apple 'Designed by Apple in California' (2013, dir. Mark Romanek) — what we're learning: slow pacing + serif + big white field"

Why cite specific works: (a) any audience can search for it and verify (b) you force yourself to think clearly about *which* specific technique you're learning (c) prevents "vague inspiration".

**4.3 Trace every decision back to a first principle**

The whole film has one first principle (e.g. "Markdown is the new typewriter."). Every concrete decision — palette / type / pacing / chrome — must trace back to this sentence.

A decision that can't be traced is decoration — delete it.

**4.4 Writing anti-slop matters more than writing do-this**

A checklist of "things this film does NOT do" (purple gradients / emoji / Lorem ipsum / Inter display / SVG-drawn human figures / rounded card + left-border accent) protects quality better than a checklist of "things this film does".

Positive decisions are infinite; the anti-slop checklist is finite — and once violated, it's slop.

**4.5 Don't implement immediately after writing — let 30 minutes pass, then re-read**

While writing your brain is in "production mode" — you can't see inconsistencies. 30 minutes later, re-reading your own storyboard you'll find:
- Two shots have the same function (delete one)
- One shot's narrative jump is too large (add a transition)
- Emotional climax is mis-placed (move it)
- Chrome elements and shot count don't align (re-align)

These 30 minutes save 2 hours of rework later.

---

## 5. Director's Notes → HTML Implementation Flow

After the director's notes are written, the HTML implementation steps:

1. **Reuse the starter components** (`Stage/Sprite/Easing/interpolate` from `assets/animations.jsx`) — don't reinvent
2. **CSS variables paste directly from Visual System Part II** — don't tweak palette inside the HTML
3. **Match Sprite start/end times against Part IV timecodes** — don't sneak in extra shots
4. **Extract chrome elements as independent components** (ChromeA/B/C/D), driven by useTime() for state switching
5. **Destination-card content must be real and readable** (not fake bar lines) — this is the 120% detail signature most repeatedly invoked in the v5 project
6. **As soon as a shot is written, capture keyframes immediately** (using `?t=NN` URL parameter + Playwright); don't write the whole film then verify at the end

---

## 6. Keyframe Verification Flow

URL-parameter implementation (must be added in the Stage component):

```js
const urlMatch = window.location.search.match(/[?&]t=([\d.]+)/);
const frozenTime = urlMatch ? parseFloat(urlMatch[1]) : null;
const [time, setTime] = useState(frozenTime != null ? frozenTime : 0);
const [playing, setPlaying] = useState(frozenTime == null);
```

→ Now `file:///path/animation.html?t=14.5` freezes at 14.5s.

Batch screenshots:

```bash
for t in 0.5 2.5 4.9 7.0 10.5 13.5 16.5 19.0 21.5 23.4 25.5 28.0 29.9; do
  npx -y playwright screenshot \
    "file://$PWD/animation.html?t=$t" \
    "keyframes/t-$t.png" \
    --viewport-size=1920,1136 \
    --wait-for-timeout=2500
done
```

Every screenshot must be verified for:
- [ ] No element overflows the 1920×1080 canvas
- [ ] Tracking and line-height are visually correct (not crammed, not loose)
- [ ] Key typographic details (period color / em-dash / italic / small caps) are recognizable
- [ ] Chrome element position + state correct
- [ ] Anti-AI-slop checklist passes
- [ ] The "worth-pausing" 120% detail is present

---

## 7. Multi-perspective Parallel Strategy (advanced)

Complex projects (launch film with no clear direction / wanting to see multiple aesthetic differences / client hasn't picked a style) can **spin up multiple subagents in parallel doing director-versions in different perspectives**.

Real-world config (2026-05-11 huashu-md-html project, 6 parallel versions):

```
v5  · Baseline (Anthropic / Penguin Classics editorial taste)
v5a · Wes Anderson (symmetry + retro + chapter cards)
v5b · Saul Bass (cut-paper + 60s big type + geometric cuts)
v5c · Wong Kar-wai (Chinese serif + slow motion + nostalgia)
v5d · Massimo Vignelli (modernist grid + red and black)
v5e · Kenya Hara (minimal Japanese + whitespace)
v5f · Yayoi Kusama (polka dots + repetition + single strong color)
```

Each subagent gets an independent brief:
- Project background (same)
- Required reading (same v5-director-notes.md as the methodology template)
- **The artist's DNA** (palette / type / visual language / pacing / signature elements / reinforced anti-slop, 30–50 chars each)
- Uniform task list (director-notes.md + animation.html + keyframes/ + README.md)
- Uniform constraints (30s / 1920×1080 / file:// / Google Fonts)

Launch in parallel + run in background; about 30–60 minutes later, 6 complete versions land.

After completion, review and compare:
1. Core aesthetic-decision table for each version
2. Keyframes side-by-side (one frame per version at the same moment)
3. Vote: which best fits the user's actual need

**Key**: do NOT let subagents reference each other — they must produce independently, otherwise they converge to "the average". Each subagent's brief must explicitly say "do not repeat v5's aesthetic".

---

## 8. Typical Trigger Scenarios

| User scenario | Triggers? | Notes |
|---------|---------|------|
| "Make a SaaS upgrade promo" | Yes | Default — run the full flow |
| "Apple-level / Super-Bowl-quality video" | Yes + escalate | Strongly recommend multi-perspective parallel |
| "30-second brand launch film" | Yes | |
| "Write a 10k-char script for this project then animate" | Yes | User has stated it explicitly |
| "Simple motion graphic, spin the logo" | No | Use the standard animations.md flow |
| "Make an onboarding animation demo" | No | Use animations.md |
| "Tutorial video with voiceover" | No | Use voiceover-pipeline.md |
| "A single hero animation" | Depends on complexity | If it's a high-spec hero, trigger; ordinary hero uses hero-animation-case-study.md |

---

## 9. Reference sample

A complete director's-notes reference sample (self-contained, inside this skill):

`assets/director-notes-samples/launch-film-30s-sample.md` (~78KB · 11,500 chars · 13 shots · all 5 parts complete)

Original project location (includes matching HTML implementation + keyframes):

- `~/.claude/skills/huashu-md-html/demos/v5-director-notes.md` (director's notes)
- `~/.claude/skills/huashu-md-html/demos/v5-six-forms.html` (HTML implementation)
- `~/.claude/skills/huashu-md-html/demos/v5-keyframes/` (keyframe-verification screenshots)

For new projects, strongly recommended: **Read this sample first** to internalize the workload and detail density before deciding whether to run the full flow.

---

## 10. Anti-patterns (don't do these)

Bad: **Write a 1,000-char "trimmed" director's notes and dive in**
→ The trimmed version inevitably misses a Visual System subsection, and you'll keep going back to add spec during HTML. Either do the 10k-char version or skip it entirely.

Bad: **Storyboard only 5–8 shots**
→ A 30-second film needs at least 12–15 shots (2–3s each). Fewer shots = uniform pacing = no climax.

Bad: **Deliver after writing director's notes without implementing**
→ The doc is not the deliverable, the animation is. Deliver both — the doc as an appendix "design rationale".

Bad: **Let subagents see each other's versions during multi-perspective parallel**
→ Subagents must be independent or they converge. Only compare during the review stage.

Bad: **Skip keyframe verification and record MP4 directly**
→ Guaranteed rework. Keyframe verification is the cheapest quality gate.

Bad: **Defer animation-detail decisions to "I'll think about it when I record"**
→ Recording is mechanical execution — no creative decisions allowed. Every decision must be locked in the director's notes.

---

*Last revised: 2026-05-11*
*Real case: huashu-md-html v2.0 launch film (v5-director-notes.md)*
