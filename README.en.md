<sub>🌐 <a href="README.md">中文</a> · <b>English</b></sub>

<div align="center">

# Huashu Design

> *"Type. Hit enter. A finished design lands in your lap."*
> *「打字。回车。一份能交付的设计。」*

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Agent-Agnostic](https://img.shields.io/badge/Agent-Agnostic-blueviolet)](https://skills.sh)
[![Skills](https://img.shields.io/badge/skills.sh-Compatible-green)](https://skills.sh)

<br>

**Say one sentence to your agent — Claude Code, Cursor, Codex, OpenClaw, Hermes all work.**

<br>

3 to 30 minutes — you ship a **product launch animation**, a clickable App prototype, an editable PPT deck, a print-grade infographic.

Not "decent for AI" quality — it looks like a real design team made it. Give the skill your brand assets (logo, colors, UI screenshots) and it reads your brand's voice; give it nothing and **three real directions picked from six thumbnails, backed by a 92-style library with a visual specimen for every style**, still keep you out of AI slop territory.

**Every design in this README was made by huashu-design itself.** No Figma, no After Effects — just a sentence + skill run. Next product launch needs a promo video? You can make it too.

```
npx skills add alchaincyf/huashu-design
```

> 📣 **Now MIT-licensed.** As of 2026-05-14 this skill is fully open-source under the [MIT License](LICENSE) — free for personal **and** commercial use, no authorization required. ([what changed](#license))

> 🆕 **3.1: Xiaohongshu (RED) carousels.** Eight layout paradigms for 3:4 image sets — specimen journal, product notebook, index, panorama strip, daily paper, trading cards, vertical blank, area infographic — and every specimen doubles as an editable template. One command slices the pages and checks type size, overflow, text across panorama seams and overlapping text. [See the specimens](#design-direction-advisor)

> **3.0: bolder directions, and projects that stop looking alike.** Six thumbnails first, then the three strongest become real designs; the style library grows to 84 (new App and Chinese & East Asian sections), each with a specimen; reference works are screenshotted before they are borrowed from; plus a facts-only design check and a "look ledger" that remembers what you've already shipped. [How it works](#core-mechanics)

[See it work](#30-showcase) · [Install](#install) · [What it does](#what-it-does) · [How it works](#core-mechanics) · [vs. Claude Design](#vs-claude-design)

> 📖 **Note for English readers**: this skill is built by a Chinese-speaking developer. The skill's agent prompts (`SKILL.md`, `references/*.md`) are in Chinese but the agent is bilingual — works fine with English tasks. The demos below are the English parallel versions; the Chinese ones are in the default [Chinese README](README.md).
>
> 📖 **致中文读者**：这个 skill 由花叔（@AlchainHust）开发。一句话能让 agent 在 3–30 分钟内交付**产品发布动画 / 可点击 App 原型 / 可编辑 PPT / 印刷级信息图**。完整中文介绍见 [README.md](README.md)（默认中文）。

</div>

---

<p align="center">
  <img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/launch-3.0.gif" alt="huashu-design 3.0 launch film" width="100%">
</p>

<p align="center"><sub>
  ▲ 3.0 launch film · 32s · every page in it was designed by 3.0 itself; edited with <a href="https://github.com/alchaincyf/huashu-motion">huashu-motion</a><br>
  👉 <a href="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/launch-3.0.mp4">Download MP4 (1080p · with music · 24MB)</a> ·
  <a href="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4">2.0 hero animation (English)</a>
</sub></p>

---

## 3.0 Showcase

All made with 3.0. The first five are picked from 6 fresh prompts run for the launch: one sentence each, the agent picked the direction, the author didn't step in. The last two are the version that won the third blind round, and a real project the author built with it after release. (Prompts and on-page copy are in Chinese.)

### Web · *Thirty-six Views of Mount Fuji* online exhibition

> "Make an online exhibition site for Hokusai's *Thirty-six Views of Mount Fuji*"

Three directions: a Rijksmuseum-style dark gallery, an Ikko Tanaka triangle window, and a Republic-era book-cover title frame. The design check flagged a collision: two versions opened with *The Great Wave*, so the dark gallery switched to *Rainstorm Beneath the Summit*.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-hokusai-hero.jpg" width="100%" alt="Hokusai exhibition hero"></p>

A chapter on Prussian blue follows, based on the Met's spectral research; all 46 prints come from the open-access collections of the Art Institute of Chicago and the Met.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-hokusai-prussian-blue.jpg" width="100%" alt="Prussian blue chapter"></p>
<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-hokusai-all-46.jpg" width="60%" alt="All 46 prints"></p>

### App · Mingji (birding log)

> "Make a prototype of a birding log App"

The real-world reference was CapWords, a 2025 Apple Design Award winner; `ref_board.py` screenshotted it into a reference board before any design started. What it borrowed: "peel a sticker out of a photo". Every bird is segmented from a real Wikimedia photo and stuck into a year-long notebook; the call waveforms are computed from real recordings.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-mingji-birding-app.jpg" width="75%" alt="Mingji birding app board"></p>

### App · What's for dinner (home recipes)

> "Make a home-cooking recipe App"

The seconds roulette landed on Lü Jingren's book design, so it became a recipe book: one dish per page, a margin column beside the fore-edge for notes like "pat it dry so the oil won't spit", and the cinnabar red reserved for the single "start cooking" seal. The look ledger noticed 5 of the last 6 deliveries used sans-serif headlines, so this one went with Song type.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-recipe-app.jpg" width="75%" alt="Recipe app board"></p>

### Slides · *A Thousand Li of Rivers and Mountains* lecture

An Abbott Miller–style dark display case; the dark ground is sampled from the darkest part of the silk. The thin bar under the cover is a thumbnail of the whole scroll, framing which stretch of the 11.9-meter painting the current slide is on.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-qianli-cover.jpg" width="100%" alt="Lecture cover"></p>
<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-qianli-pages.jpg" width="100%" alt="Four lecture slides"></p>

### Slides · How the black hole photo was taken

Referenced Jonathan Corum's lecture slides: black ground, photos as the protagonist, labels written directly on the image. Every slide cites its sources.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-blackhole-pages.jpg" width="100%" alt="Black hole deck, four slides"></p>

### App · Green Thumb (won the third blind round)

Reads a plant like vital signs. The App prototype is laid out as a composed presentation board, with the phones staggered.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-plant-health-app.jpg" width="75%" alt="Green Thumb plant health app"></p>

### Web · Travel archive (the author's own project)

A map of every travel photo from three years, in a Kaoru Kasai–style long scroll of white paper and Mincho type: a satellite map ties all the trips together up top, then one chapter per trip. After picking it the author said "try not to leave any out", and it saved that as experience: personal memory archives should be complete, scoped to photo archives only, not product UIs.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v3.0.0/case-travel-archive.jpg" width="100%" alt="Travel archive"></p>

---

## Install

```bash
npx skills add alchaincyf/huashu-design
```

**DeepSeek Harness**: this repo is also a DSH plugin. `dsh plugin --profile desktop add github:alchaincyf/huashu-design` (use `web` for the web app), then restart DSH. Remove with `dsh plugin --profile desktop remove huashu-design`.

> **Verify after install**: this skill is more than a single SKILL.md — the `references/`, `assets/`, `scripts/`, and `demos/` subdirectories hold 99 referenced recipes, scripts, and assets that the skill depends on. After installing, check the install path (e.g. `~/.claude/skills/huashu-design/`); if you only see SKILL.md and none of those subdirectories, your `skills` CLI is too old (≤1.5.15 had a bug that synced only the single file, fixed in 1.5.19). Upgrade and reinstall:
>
> ```bash
> npm i -g skills@latest        # or npx skills@latest add alchaincyf/huashu-design
> ```
>
> If it's still wrong after upgrading, fall back to a `git clone` install — clone the repo into any skills directory:
>
> ```bash
> git clone https://github.com/alchaincyf/huashu-design.git ~/.claude/skills/huashu-design
> ```

Then just talk to Claude Code:

```
"Make a keynote for AI psychology. Give me 3 style directions to pick from."
"Build an iOS prototype for a Pomodoro app — 4 screens, actually clickable."
"Turn this logic into a 60-second animation. Export MP4 and GIF."
"Run a 5-dimension expert review on this design."
```

No buttons, no panels, no Figma plugin. Agent-agnostic — drops into Claude Code, Cursor, Trae, Hermes, OpenClaw, or any markdown-skill-capable agent.

---

## Star History

<p align="center">
  <a href="https://star-history.com/#alchaincyf/huashu-design&Date">
    <img src="https://api.star-history.com/svg?repos=alchaincyf/huashu-design&type=Date" alt="huashu-design Star History" width="80%">
  </a>
</p>

---

## What it does

| Capability | Deliverable | Typical time |
|---|---|---|
| Interactive prototype (App / Web) | Single-file HTML · real iPhone bezel · clickable · Playwright-verified | 10–15 min |
| Slide decks | HTML deck (browser presentation) + editable PPTX (text frames preserved) | 15–25 min |
| Motion design | MP4 (25fps / 60fps interpolation) + GIF (palette-optimized) + BGM | 8–12 min |
| Design variations | 3+ side-by-side · Tweaks live params · cross-dimension exploration | 10 min |
| Infographic / data viz | Print-quality typography · exports to PDF/PNG/SVG | 10 min |
| Xiaohongshu carousel / cover | 3:4 image sets (≤18) · 8 paradigm templates · continuous panorama strips · one-command slicing with checks | 10–15 min |
| Design direction advisor | Three logics × two candidates each · six thumbnails → three real designs, the other three kept as alternates | 10 min |
| 5-dimension expert critique | Radar chart + Keep/Fix/Quick Wins · actionable punch list | 3 min |

---

## Demo Gallery

> English parallel versions of the demos. Chinese versions live at the default filenames (see the Chinese README).

### Design Direction Advisor

The fallback for vague briefs: **three complementary logics, two candidates each** — best designer, an award-winning work in the same medium (screenshotted first), and a seconds roulette over the style library. Six thumbnails, then the three strongest and most distinct become **real designs** to choose from, with the other three as alternates. Backed by a **92-style HTML-native library** (web 20 + deck 20 + infographic 20 + app 12 + Chinese & East Asian 12 + Xiaohongshu 8, pure CSS, no image generation), each with a specimen.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w3-fallback-advisor-en.gif" width="100%"></p>
<p align="center"><sub>The animation shows the 2.0 flow (one design per logic)</sub></p>

The two sections new in 3.0 — every cell is a specimen (pure HTML/CSS, fictional subjects and numbers):

<p align="center"><img src="assets/style-specimens/sheet-east.jpg" width="100%" alt="12 Chinese and East Asian design styles"></p>
<p align="center"><img src="assets/style-specimens/sheet-app.jpg" width="100%" alt="12 app styles"></p>

New in 3.1, the Xiaohongshu section: each cell is one paradigm's cover plus an inner page (the panorama is three pages forming one picture). They come from a real post, so all eight carry the same story:

<p align="center"><img src="assets/style-specimens/sheet-xhs.jpg" width="100%" alt="8 Xiaohongshu carousel paradigms"></p>

### iOS App Prototype

Pixel-accurate iPhone 15 Pro body (Dynamic Island / status bar / Home Indicator) · state-driven multi-screen navigation · real images pulled from Wikimedia/Met/Unsplash · Playwright click tests before delivery.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c1-ios-prototype-en.gif" width="100%"></p>

### Motion Design Engine

Stage + Sprite time-slice model · `useTime` / `useSprite` / `interpolate` / `Easing` — four APIs cover every animation need · one command exports MP4 / GIF / 60fps-interpolated / BGM-scored finals.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c3-motion-design-en.gif" width="100%"></p>

### HTML Slides → Editable PPTX

HTML decks for browser presentation · `html2pptx.js` reads DOM computed styles and translates each element into real PowerPoint objects · exports are **actual text frames**, not image-bed fakes.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c2-slides-pptx-en.gif" width="100%"></p>

### Tweaks · Live Variation Switching

Colors / typography / information density parameterized · side panel toggle · pure-frontend + `localStorage` persistence · survives reload.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c4-tweaks-en.gif" width="100%"></p>

### Infographic / Data Viz

Magazine-grade typography · precise CSS Grid columns · `text-wrap: pretty` typographic details · driven by real data · exports to vector PDF / 300dpi PNG / SVG.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c5-infographic-en.gif" width="100%"></p>

### 5-Dimension Expert Critique

Philosophical coherence · visual hierarchy · execution craft · functionality · innovation — each scored 0–10 · radar-chart visualization · outputs Keep / Fix / Quick Wins punch list.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/c6-expert-review-en.gif" width="100%"></p>

### Junior Designer Workflow

No heroic one-shot attempts: start with assumptions + placeholders + reasoning, show it to the user early, then iterate. Fixing a misunderstanding early is 100× cheaper than fixing it late.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w2-junior-designer-en.gif" width="100%"></p>

### Core Asset Protocol · 5-step hard process

Mandatory whenever the task involves a specific brand: ask → search → download (three fallback paths) → verify + extract → write `brand-spec.md` covering **logo, product shots, UI screenshots, colors, fonts** — all required assets, not just colors.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w1-brand-protocol-en.gif" width="100%"></p>

---

## Core Mechanics

### Core Asset Protocol

The hardest rule in the skill. When the task touches a specific brand (Stripe, Linear, Anthropic, DJI, your own company, etc.), five steps are enforced:

| Step | Action | Purpose |
|---|---|---|
| 1 · Ask | Checklist of 6 asset types: logo / product shots / UI screenshots / color palette / fonts / brand guidelines | Respect existing resources |
| 2 · Search official channels | `<brand>.com/brand` · `<brand>.com/press` · `brand.<brand>.com` · product pages · launch films | Find authoritative assets |
| 3 · Download by asset type | Logo (SVG → inline-SVG in HTML → social avatar) · Product shots (hero → press kit → launch video frames → AI-generated from reference) · UI (App Store screenshots → official video frames) | Three fallback paths per asset type |
| 4 · Verify + extract | Check logo fidelity · product image resolution · UI freshness · grep color hex from real assets | **Never guess from memory** |
| 5 · Freeze to spec | Write `brand-spec.md` with logo paths, product image paths, UI screenshot paths, CSS variables for colors/fonts | Un-frozen knowledge evaporates |

**Ranking of asset importance** (from the skill's internal rubric):

1. Logo — mandatory for any brand
2. Product renders — mandatory for physical products
3. UI screenshots — mandatory for digital products
4. Color values — auxiliary
5. Fonts — auxiliary

A/B-tested (v1 vs v2, 6 agents each): **v2 reduced stability variance by 5×**. Stability of stability — that's the real moat.

### Design Direction Advisor (Fallback)

Triggered when the brief is too vague to execute (rebuilt in 3.0):

- One round of questions, asking for references up front (name / logo / brand colors / sites you like)
- Fetch the real images the content needs (public domain / royalty-free) before designing
- **Three logics, two candidates each — six in total**: ① Best designer (two designers of different temperament, thinking from scratch the way they would) ② Real-world reference (two award-winning works **in the same medium** — apps for an app, publications for a deck; `scripts/ref_board.py` screenshots them so the agent actually looks before extracting grid, type ratios and color proportions) ③ Seconds roulette (`date +%S` picks one style from the matching section and one from the Chinese & East Asian section; the agent opens its specimen first)
- **Six thumbnails → three full designs**: strong on its own, different from each other, not a repeat of your recent projects. The other three thumbnails come along as alternates
- **You never pick a style from words alone** — it stops once the designs are on the table
- Backed by a **92-style HTML-native library**, each with a specimen image and source (`assets/style-specimens/`) — ammunition, not dogma

Why: we ran three rounds of blind before/after tests on fixed briefs (internal). Round one forced a big metaphor onto every direction, turned pages into props, and won 1 of 4; round two piled on bans to dodge the "AI default look", made all three directions "too regular, too boring", and lost both briefs; round three switched to more options instead of more bans — more candidates, visible specimens, real references — and won both.

### Learns as you use it: experience, look ledger, design check

- **Experience**: `scripts/learn.py` recalls your verbatim taste notes ("too plain", "A's layout with C's colors") and past lessons before work starts, and records what's worth keeping afterwards — it tells you when it records, and you can decline
- **Look ledger**: every delivery logs what it looked like (background, palette, fonts, layout skeleton, plus the project name and path), so the next project steers away — the "each one fine, together all the same" kind of monotony
- **Design check**: `scripts/design_lint.py` only measures checkable facts — broken images, unreadably small text, low contrast, console errors are red; habitual template chrome (uppercase eyebrows, "A · B · C" chains) is yellow; `compare` and `ledger check` catch reskins and repeats. Whether it looks good is your call; it gives no score
- All of this lives only on your machine in `~/.huashu-design/`, never ships with the skill; delete the folder to forget everything

### Junior Designer Workflow

The default working mode across every task:

- Send the full question set in one batch, wait for all answers before moving
- Write assumptions + placeholders + reasoning comments directly into the HTML
- Show it to the user early (even if just gray blocks)
- Fill in real content → variations → Tweaks — show at each of these three steps
- Manually eyeball the browser with Playwright before delivery

### Fact Verification First (Principle #0)

The highest-priority rule, added after a real failure mode: when the task mentions a specific product / technology / event (e.g., "DJI Pocket 4", "Nano Banana Pro", "Gemini 3 Pro"), the first action **must** be a `WebSearch` to confirm existence, release status, current version, and specs. No claims from training-corpus memory. Cost of a search: ~10 seconds. Cost of a wrong assumption: 1–2 hours of rework.

### Anti AI-slop Rules

Avoid the visual common denominator of AI output: purple gradients, emoji icons, rounded-corner + left border accent, SVG humans, Inter-as-display, **CSS silhouettes standing in for real product shots**, and the 2026 generation of template chrome (an uppercase eyebrow over every heading, "A · B · C" dot chains, trailing "→", one recolored word per headline). No invented data, testimonials or logo walls.

"Look families" like warm paper + serif or dark + one accent are not banned: the versions users approved in blind tests included both. What to avoid is all three directions crowding into one family, or every project looking the same — that's the look ledger's job.

---

## vs. Claude Design

I'll be upfront: the Core Asset Protocol's philosophy was lifted from system prompts Anthropic wrote for Claude Design. That prompt hammers home a single idea — **great hi-fi design doesn't start from a blank page, it grows from existing design context**. That one principle is the difference between a 65-point design and a 90-point design.

Positioning differences:

| | Claude Design | huashu-design |
|---|---|---|
| Form | Web product (used in browser) | Skill (used in Claude Code) |
| Quota | Subscription quota | API usage · parallel agents unblocked |
| Output | Canvas + Figma export | HTML / MP4 / GIF / editable PPTX / PDF |
| Interaction | GUI (click, drag, edit) | Conversation (tell agent, wait) |
| Complex animation | Limited | Stage + Sprite timeline · 60fps export |
| Agent compatibility | Claude.ai only | Claude Code / Cursor / Trae / Hermes / OpenClaw |

Claude Design is a **better graphics tool**. Huashu-design makes **the graphics-tool layer disappear**. Two paths, different audiences.

---

## Security & Data Flow

The core pipeline (design → render → MP4/PDF/PPTX export) runs **100% locally — zero network calls, zero API keys**. Cloud features (Doubao TTS narration, AI video review) are isolated in `scripts/cloud/`, fully optional: your own keys, official vendor APIs only, and an explicit `--yes` consent gate before anything leaves your machine. No telemetry; nothing is ever sent to any author-controlled server. The 3.0 local records (taste experience, look ledger) are written only to `~/.huashu-design/` and never uploaded; the reference board only visits URLs when you have the agent screenshot reference works. Every outbound host, credential touchpoint, and deletion boundary is exhaustively declared in [SECURITY.md](SECURITY.md) — point your agent at it and verify against the code.

---

## Limitations

- **No layer-editable PPTX-to-Figma round-trip.** The output is HTML — screenshottable, recordable, image-exportable, but not draggable into Keynote for text-position tweaks.
- **Framer-Motion-tier complex animations are out of scope.** 3D, physics simulation, particle systems exceed the skill's boundaries.
- **Brand-from-zero design quality drops to 60–65 points.** Drawing hi-fi from nothing was always a last resort.

This is an 80-point skill, not a 100-point product. For people unwilling to open a graphical UI, an 80-point skill beats a 100-point product.

---

## Repository Structure

```
huashu-design/
├── SKILL.md                 # Main doc (read by agent, Chinese)
├── README.md                # Chinese README (default)
├── README.en.md             # English README (this file)
├── assets/                  # Starter Components
│   ├── animations.jsx       # Stage + Sprite + Easing + interpolate
│   ├── ios_frame.jsx        # iPhone 15 Pro bezel
│   ├── android_frame.jsx
│   ├── macos_window.jsx
│   ├── browser_window.jsx
│   ├── deck_stage.js        # HTML deck engine
│   ├── deck_index.html      # Multi-file deck assembler
│   ├── design_canvas.jsx    # Side-by-side variation display
│   ├── showcases/           # 24 prebuilt samples (8 scenes × 3 styles)
│   ├── style-specimens/     # Specimens for all 92 styles (html source + jpg) and section overviews; the xhs/ ones double as templates
│   └── bgm-*.mp3            # 6 scene-specific background tracks
├── references/              # Drill-down docs by task (Chinese)
│   ├── animation-pitfalls.md
│   ├── directions.md        # Three directions: six candidates → thumbnails → pick three
│   ├── design-styles.md     # 92 HTML-native styles (web 20 + deck 20 + infographic 20 + app 12 + Chinese & East Asian 12 + Xiaohongshu 8)
│   ├── modules/             # Web / deck / infographic / Xiaohongshu / motion module manuals
│   ├── slide-decks.md
│   ├── editable-pptx.md
│   ├── critique-guide.md
│   ├── video-export.md
│   └── ...
├── scripts/                 # Export toolchain
│   ├── render-video.js      # HTML → MP4
│   ├── xhs_render.py        # Xiaohongshu pages → 3:4 images + checks
│   ├── convert-formats.sh   # MP4 → 60fps + GIF
│   ├── add-music.sh         # MP4 + BGM
│   ├── export_deck_pdf.mjs
│   ├── export_deck_pptx.mjs
│   ├── html2pptx.js
│   ├── design_lint.py       # Design check, reskin/repeat detection, look ledger
│   ├── learn.py             # Taste experience read/write
│   ├── ref_board.py         # Screenshot reference works into a board
│   ├── capabilities.py      # Detect local capabilities (image gen, sibling skills, Node, ffmpeg)
│   └── verify.py
└── demos/                   # Capability demos referenced by this README
```

---

## Origin Story

The day Anthropic launched Claude Design I played with it until 4 a.m. A few days later I realized I hadn't opened it once since — not because it's bad (it's the most polished product in the category) but because I'd rather have an agent work in my terminal than open any graphical UI.

So I had an agent deconstruct Claude Design itself (including the system prompts circulating in the community, the brand asset protocol, the component mechanics), distill it into a structured spec, then write it as a skill installed in my own Claude Code.

Thanks to Anthropic for writing the Claude Design prompts so clearly. This kind of derivative work inspired by other products is the new form of open-source culture in the AI era.

---

## Available Languages

Community-maintained translations of this skill. Translation quality and license terms are the responsibility of each maintainer — please check the linked repo before relying on it.

| Language | Maintainer | Repository |
|---|---|---|
| English | [@namandhakad712](https://github.com/namandhakad712) | [namandhakad712/huashu-design-en](https://github.com/namandhakad712/huashu-design-en) |
| 한국어 (Korean) | [@ktkarchive](https://github.com/ktkarchive) | [ktkarchive/ktk-design](https://github.com/ktkarchive/ktk-design) |
| Tiếng Việt (Vietnamese) | [@letrquan](https://github.com/letrquan) | [letrquan/huashu-design](https://github.com/letrquan/huashu-design) |

Want to add your language? Fork the repo, translate `SKILL.md` + `README.md`, and open an issue here so we can link it.

---

## License

**Relicensed to MIT on 2026-05-14.** This skill was previously released under a Personal Use License that restricted commercial use. That restriction is now removed.

Under the [MIT License](LICENSE) you are free to **use, modify, and distribute** this skill for any purpose, **including commercial use** — inside companies, in client deliverables, as part of a paid product, anywhere. No prior authorization, no licensing fee, no notification required. Attribution is appreciated but not required.

One exception: the demo stickers in `assets/style-specimens/xhs/_kit/stickers/` come from [huashu-bird-sticker](https://github.com/alchaincyf/huashu-bird-sticker) and are licensed under PolyForm Shield 1.0.0 (see the LICENSE.md in that folder). They only demonstrate the layouts; use your own assets in your work.

---

## Connect · Huasheng (Huashu)

Huasheng is an AI-native coder, independent developer, and AI content creator. Notable work: Cat Fill Light (App Store Top 1 in Paid category), *A Book on DeepSeek*, Nüwa.skill (GitHub 30k+ stars). Combined 300k+ followers across platforms.

| Platform | Handle | Link |
|---|---|---|
| X / Twitter | @AlchainHust | https://x.com/AlchainHust |
| WeChat Official Account | 花叔 | Search "花叔" in WeChat |
| Bilibili | 花叔 | https://space.bilibili.com/14097567 |
| YouTube | 花叔 | https://www.youtube.com/@Alchain |
| Xiaohongshu | 花叔 | https://www.xiaohongshu.com/user/profile/5abc6f17e8ac2b109179dfdf |
| Official Site | huasheng.ai | https://www.huasheng.ai/ |
| Developer Hub | bookai.top | https://bookai.top |

For collaborations or sponsored content, DM on any of the above.

<p align="center"><img src="https://raw.githubusercontent.com/alchaincyf/alchaincyf/main/assets/follow.svg" width="100%" alt="Follow Huashu: WeChat 花叔 · Bilibili 花叔v · Xiaohongshu 花叔"></p>
