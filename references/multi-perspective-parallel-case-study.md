# Multi-Perspective Parallel Experiment · Case Study

> huashu-md-html v2.0 launch film project · 2026-05-11
> Six artists' perspectives — parallel director's notes + HTML + keyframes experiment

---

## Background

When the user asked for "a 30-second upgrade promo for huashu-md-html v2.0", the main thread first delivered the v5 baseline (Anthropic / Penguin Classics editorial taste). But the user thought it could go further and gave a critical instruction:

> "Spin up different subagents to generate 6 versions with entirely different expressions and visual designs. Try enabling different directors and artists. Once they're all done, judge and review."

This was the first systematic "multi-perspective parallel director's notes" experiment, and it validated a reusable workflow.

---

## Why these 6 perspectives

Don't just pick any 6 designers — they must have **extremely high visual diversity** to avoid converging.

The 6 perspectives chosen (with rationale):

| Perspective | School | Aesthetic anchor | How it differs from the others |
|------|------|---------|----------------|
| **v5 baseline** | Modern publisher | Anthropic terracotta orange + Penguin Classics serif + Vignelli grid | Safe "good-taste" pick |
| **v5a Wes Anderson** | Cinema chapter aesthetic | The French Dispatch magazine feel + 1960s Olivetti industrial catalogue | Symmetric composition + chapter cards + decorative borders |
| **v5b Saul Bass** | 60s film-title art | Cut-paper + Trajan caps + flowing geometry | Cut-paper silhouettes + big type + strong diagonals |
| **v5c Wong Kar-wai** | HK New Wave | *In the Mood for Love* / *2046* letterboxing + Chinese serif | Slow pacing + hazy halo + Chinese-led |
| **v5d Massimo Vignelli** | 1970s modernism | Knoll identity manual + NYC Subway map | Strict grid + 3-color iron rule + refusal of ornament |
| **v5e Kenya Hara** | Minimal Japanese | MUJI posters + *White* | Whitespace philosophy + no chrome + ma (間) |
| **v5f Yayoi Kusama** | Installation art | Infinity Mirror Rooms + Polka Dot Obsession | Obsessive repetition + single strong color + polka dots |

**Selection principles**:
1. **3 different geographic cultures** (Western cinema / Japanese design / HK Chinese)
2. **3 different eras** (1960s / 1970s / 2010s+)
3. **3 different mediums** (film / graphic design / installation art)
4. **Every one has a visual signature "completely opposite to the generic SaaS aesthetic in the training corpus"**

---

## Execution flow

### Step 1 · Write an independent brief for each perspective (~15 min)

Each brief contains 8 fixed fields:

```
1. Project background (same across all)
2. Required reading (the same v5-director-notes.md as a methodology template)
3. What you have to do (4 deliverables)
4. The artist's DNA (6 core fields):
   - Palette (specific HEX)
   - Typography (specific names + alternates)
   - Visual language (a few core rules)
   - Signature elements (identifiable signatures)
   - Pacing (differentiates from other perspectives)
   - Anti-AI-slop reinforcement (no-go zones in this style's context)
5. 30-second structural reference (4–6 shot drafts)
6. Destination-card design requirement (must stay real and readable)
7. Hard constraints (30s / 1920×1080 / file:// / Google Fonts CDN)
8. Output verification checklist + completion-report format
```

**Key**: every brief must emphasize "**do NOT repeat v5's aesthetic**" — otherwise the subagent gets influenced by v5 director-notes and converges.

### Step 2 · Launch 6 subagents in parallel (6 Agent tool calls in one message)

```js
Agent({ subagent_type: "general-purpose", run_in_background: true, name: "v5a-anderson", ... })
Agent({ subagent_type: "general-purpose", run_in_background: true, name: "v5b-bass", ... })
// ... 6 total
```

Run in background; expect 30–60 min.

### Step 3 · Idle work during the wait

Don't poll agent status. Subagents auto-emit task-notifications when they finish. While waiting, do:

- Fix bugs in the main thread's v5 baseline
- Write the review framework (the dimensions to score each version + Q&A)
- Distill methodology back into the skill (which is exactly where this case study came from)
- Prepare the final summary doc skeleton

### Step 4 · Failure handling (~16% failure rate, acceptable)

Real-world observation: roughly 1 of 6 subagents fails from network or token-limit issues (Bass first-round socket error). Handling:

1. When the completion notification arrives, **immediately inspect that agent's output folder**
2. Missing key deliverables → restart that agent (same brief, optionally noting "previous run failed, please re-execute")
3. Partial completion (e.g. has html but no screenshots) → main thread fills in Playwright screenshots; do not restart the agent

### Step 5 · Systematic review once all 6 complete

Review framework (5 dimensions + 3 top-level questions + use-case mapping):

```
5-dimension scoring (each 1–10):
- Distinctiveness — visual differentiation
- Coherence — aesthetic consistency
- Anti-slop — execution against AI slop
- Story arc — pacing and narrative arc
- Pause-and-look — detail density

3 top-level questions:
- Q1 Screenshot-worthy? (can it trigger a pause on social platforms)
- Q2 One-liner memory? (does a thesis-level memory stick)
- Q3 Time-resistant? (does it still look upmarket 5 years later)

Use case assignment (by platform and audience):
- WeChat / X / Bilibili / Moments / Dribbble / client demo / private channel / ...
```

See REVIEW.md alongside `assets/director-notes-samples/launch-film-30s-sample.md`.

---

## Experiment output (facts)

### Document volume

- v5 baseline director-notes: 11,500 characters
- 6 perspective director-notes, each 4,000–12,000 characters
- Total doc volume: ~55,000–70,000 characters
- All 5 sections complete: 6/6 versions

### HTML implementation

- One animation.html per version, 30 seconds, 1920×1080
- File size 28–74KB
- All open via file:// (no server needed)

### Keyframes

- 10–18 PNGs per version, covering the full 30-second arc
- Total screenshots: 80+
- Average PNG size: 100–200KB

### Duration

- 6 subagents running in parallel: ~12–15 minutes (per duration_ms)
- Main thread parallel idle work (v5 fixes + methodology writing): completed in the same window
- Overall "from launching the 6 perspectives to all deliverables in place": ~60 minutes

---

## Key insights (for future huashu-design users)

### Insight 1 · The "write the 10k-char director's notes first" methodology is **fully reproducible**

All 6 subagents produced 4,000–12,000-character complete specs following the 5-part structure, and every HTML implementation hit marketing-ready quality. That proves the methodology does not depend on a single executor's talent — **as long as the brief is clear, multiple independent executors can produce consistently high-quality results**.

### Insight 2 · "Perspectives" must be specific down to "work + year"

Every brief listed specific works to dialogue with:
- Anderson → *The French Dispatch* (2021) + *Moonrise Kingdom* (2012) + Penguin Classics dust jackets + 1960s Olivetti catalogues
- WKW → *In the Mood for Love* (2000) + *2046* (2004)
- Vignelli → 1972 NYC Subway map + Knoll identity manual + *The Vignelli Canon*
- Hara → MUJI brand 1995–2023 + *White* + Junya Ishigami transparency
- Kusama → Infinity Mirrored Rooms (2013–2023) + Polka Dot Obsession installations

**Result**: every subagent accurately captured that work's core visual DNA, not the "average" of the school.

### Insight 3 · The "style-specific reinforced version" of the anti-AI-slop checklist is critical

Generic anti-slop (purple gradients / emoji / SVG-drawn human figures) applies to every version. But **each style also needs its own anti-slop**:

- Bass: no Helvetica (too clean — Bass is rough)
- Vignelli: no rounded corners (every corner 90°)
- Hara: no gradients of any kind + no sans display
- Kusama: no modern SaaS look
- Anderson: no cyber palette
- WKW: no Inter (WKW uses serifs)

With these added, the 6 versions hit a very high purity and none of them converged.

### Insight 4 · The real value of multiple perspectives is not "pick the winner"

The original idea was to A/B-test and pick the best one. During review, the discovery was: **all 6 versions have clear use cases**:
- v5 baseline → product page / WeChat reader (high information density)
- Anderson → WeChat long-form header (magazine-flip feel)
- WKW → Bilibili / Chinese-culture-leaning (nostalgia warmth)
- Vignelli → design community / Dribbble (every frame is a printed poster)
- Hara → client demo / static screenshots (minimal philosophy)
- Kusama → X short video / viral propagation (visual impact)

**Conclusion**: marketing isn't single-shot, it's platform-specific multiplex. The real value of 6 parallel perspectives is **giving a single project 6 differentiated weapons**, not making 5 of them unfit for primetime.

### Insight 5 · ~16% subagent failure rate is acceptable

1 of 6 failed (Bass first-round socket error). Recovery cost: restart + 5-minute trimmed brief, then another 12–15 min wait. **Compared to running 6 versions sequentially through 1 agent (90+ min)** — parallel + retry is clearly more economical.

### Insight 6 · The main thread MUST do substantive idle work during the wait

Subagent completion takes 12–15 minutes. The main thread absolutely shouldn't sit idle:

- **Fix bugs in the main version** (whatever the user has already flagged)
- **Write the review framework** (to fill in during review)
- **Distill methodology into the skill** (this case study, for example)
- **Prepare the final summary** (so the user comes back to clarity)

This is the main thread's responsibility in a parallel multi-agent workflow — not a PM waiting on results, but an orchestrator pushing work in sync.

---

## When to engage "multi-perspective parallel"

| Scenario | Engage? | Reason |
|------|---------|------|
| User explicitly says "show me different directions" / "make a few more versions" | Yes — engage immediately | Direct request |
| First version delivered but user is unsatisfied and can't articulate why | Yes | A/B beats "I'll guess what you want" |
| Project will be distributed across multiple platforms (X / WeChat / Bilibili / Moments) | Yes | One version per platform |
| Client hasn't picked a style but has budget (time + tokens) | Yes | Iterating back-and-forth = 5× cost |
| User already gave a clear style reference and wants only one version | No | Waste |
| Task is a simple motion graphic / icon animation | No | Over-engineering |
| Time-constrained < 30 minutes | No | Subagents can't finish |

---

## Full methodology flowchart

```
User brief (with quality expectations)
       ↓
[Main thread] Write v5 baseline director's notes (10k-char 5-part)
       ↓
[Main thread] Implement v5 HTML + capture keyframes (marketing baseline)
       ↓
[Decision point] Engage multi-perspective?
       ↓ YES
[Main thread] Pick 6 differentiated perspectives + write 6 independent briefs (8 fields each)
       ↓
[6 subagents in parallel]
   ├── v5a brief → director-notes + html + keyframes + README
   ├── v5b brief → ...
   ├── v5c brief → ...
   ├── v5d brief → ...
   ├── v5e brief → ...
   └── v5f brief → ...
       ↓
[Main thread in sync] Fix v5 bugs · write review framework · distill methodology
       ↓
[All 6 notifications arrive]
       ↓
[Main thread] Failure detection + retry / supplementary screenshots
       ↓
[Main thread] 5-dimension scoring + 3 top-level questions + use-case mapping
       ↓
[Main thread] Write final REVIEW.md
       ↓
[Delivery] 6 complete versions + review + per-platform distribution recommendations
```

---

## Related docs

- Full methodology: `references/launch-film-director-notes.md`
- Single-perspective sample: `assets/director-notes-samples/launch-film-30s-sample.md` (v5 baseline)
- Real project location: `~/.claude/skills/huashu-md-html/demos/` (contains all 6 + 1 perspectives)
- Review writeup: `~/.claude/skills/huashu-md-html/demos/REVIEW.md`

---

*Last updated: 2026-05-11*
*Real case study: huashu-md-html v2.0 launch film 6-perspective parallel experiment*
