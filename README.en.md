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

Not "decent for AI" quality — it looks like a real design team made it. Give the skill your brand assets (logo, colors, UI screenshots) and it reads your brand's voice; give it nothing and the built-in 20 design vocabularies still keep you out of AI slop territory.

**Every animation in this README was made by huashu-design itself.** No Figma, no After Effects — just a sentence + skill run. Next product launch needs a promo video? You can make it too.

```
npx skills add alchaincyf/huashu-design
```

> 📣 **Now MIT-licensed.** As of 2026-05-14 this skill is fully open-source under the [MIT License](LICENSE) — free for personal **and** commercial use, no authorization required. ([what changed](#license))

[See it work](#demo-gallery) · [Install](#install) · [What it does](#what-it-does) · [How it works](#core-mechanics) · [vs. Claude Design](#vs-claude-design)

> 📖 **Note for English readers**: this skill is built by a Chinese-speaking developer. The skill's agent prompts (`SKILL.md`, `references/*.md`) are in Chinese but the agent is bilingual — works fine with English tasks. The demos below are the English parallel versions; the Chinese ones are in the default [Chinese README](README.md).
>
> 📖 **致中文读者**：这个 skill 由花叔（@AlchainHust）开发。一句话能让 agent 在 3–30 分钟内交付**产品发布动画 / 可点击 App 原型 / 可编辑 PPT / 印刷级信息图**。完整中文介绍见 [README.md](README.md)（默认中文）。

</div>

---

<p align="center">
  <video src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4" autoplay muted loop playsinline width="100%">
    Your browser doesn't support inline video. <a href="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4">Download MP4</a>.
  </video>
</p>

<p align="center"><sub>▲ 10-second hero animation showing what huashu-design does (<a href="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/hero-animation-v10-en.mp4">download MP4</a> if autoplay doesn't work)</sub></p>

---

## Install

```bash
npx skills add alchaincyf/huashu-design
```

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

### Plugin marketplaces (Claude / Grok / Codex / Pi)

`npx skills add` stays the default. These hosts can also install from the repo as a plugin marketplace:

```bash
# Claude Code
claude plugin marketplace add alchaincyf/huashu-design
claude plugin install huashu-design@huashu-design --scope user

# Grok
grok plugin marketplace add alchaincyf/huashu-design
grok plugin install huashu-design --trust
grok plugin enable huashu-design

# Codex
codex plugin marketplace add alchaincyf/huashu-design
codex plugin add huashu-design@huashu-design

# Pi
pi install git:github.com/alchaincyf/huashu-design
```

The Skill source of truth remains root `SKILL.md` + `assets/` + `references/` + `scripts/`. `plugins/huashu-design/skills/huashu-design/` is a **tracked-file copy** (not a symlink farm; untracked files are excluded): Codex copies `skills/` and drops links. After editing the Skill, run `node scripts/build-plugin-leaf.mjs`; before a plugin release, run `node scripts/check-plugin-release.mjs --write`.

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
| Design direction advisor | 5 schools × 20 philosophies · 3 directions recommended · Demos generated in parallel | 5 min |
| 5-dimension expert critique | Radar chart + Keep/Fix/Quick Wins · actionable punch list | 3 min |

---

## Demo Gallery

> English parallel versions of the demos. Chinese versions live at the default filenames (see the Chinese README).

### Design Direction Advisor

The fallback for vague briefs: pick 3 differentiated directions from 5 schools × 20 philosophies, generate all 3 demos in parallel, let the user choose.

<p align="center"><img src="https://github.com/alchaincyf/huashu-design/releases/download/v2.0/w3-fallback-advisor-en.gif" width="100%"></p>

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

Triggered when the brief is too vague to execute:

- Don't run on generic intuition — enter Fallback mode
- Recommend 3 differentiated directions from 5 schools × 20 philosophies, each **from a different school**
- Each comes with flagship works, gestalt keywords, representative designer
- Generate 3 visual demos in parallel, let the user choose
- Once chosen, continue into the Junior Designer main flow

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

Avoid the visual common denominator of AI output (purple gradients / emoji icons / rounded-corner + left border accent / SVG humans / Inter-as-display / **CSS silhouettes standing in for real product shots**). Use `text-wrap: pretty` + CSS Grid + carefully chosen serif display faces + oklch colors.

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

The core pipeline (design → render → MP4/PDF/PPTX export) runs **100% locally — zero network calls, zero API keys**. Cloud features (Doubao TTS narration, AI video review) are isolated in `scripts/cloud/`, fully optional: your own keys, official vendor APIs only, and an explicit `--yes` consent gate before anything leaves your machine. No telemetry; nothing is ever sent to any author-controlled server. Every outbound host, credential touchpoint, and deletion boundary is exhaustively declared in [SECURITY.md](SECURITY.md) — point your agent at it and verify against the code.

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
│   └── bgm-*.mp3            # 6 scene-specific background tracks
├── references/              # Drill-down docs by task (Chinese)
│   ├── animation-pitfalls.md
│   ├── design-styles.md     # 20 design philosophies in detail
│   ├── slide-decks.md
│   ├── editable-pptx.md
│   ├── critique-guide.md
│   ├── video-export.md
│   └── ...
├── scripts/                 # Export toolchain
│   ├── render-video.js      # HTML → MP4
│   ├── convert-formats.sh   # MP4 → 60fps + GIF
│   ├── add-music.sh         # MP4 + BGM
│   ├── export_deck_pdf.mjs
│   ├── export_deck_pptx.mjs
│   ├── html2pptx.js
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

---

## Connect · Huasheng (Huashu)

Huasheng is an AI-native coder, independent developer, and AI content creator. Notable work: Cat Fill Light (App Store Top 1 in Paid category), *A Book on DeepSeek*, Nüwa.skill (GitHub 21k+ stars). Combined 300k+ followers across platforms.

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
