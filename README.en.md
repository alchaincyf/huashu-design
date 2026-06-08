<div align="center">

# Product Visual Design Skill

> **Agent-agnostic product visual design skill** — create product visuals, commercial PPTs, UI mockups, infographics with HTML / SVG / PPTX. Anti-AI-slop, brand-asset-first, editable deliverables.

[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Agent-Agnostic](https://img.shields.io/badge/Agent-Agnostic-blueviolet)](https://skills.sh)
[![Skills](https://img.shields.io/badge/skills.sh-Compatible-green)](https://skills.sh)

</div>

---

## What is this

An agent skill for product visual expression. Say one sentence to your agent — it produces shippable product visuals, decks, UI mockups, and infographics in HTML / SVG / PPTX.

Works with any agent that supports markdown-based skills — Hermes, Lurk, OpenClaw, Claude Code, Cursor, Codex, and more.

```bash
# After merge to master
npx skills add CCandle/product-design

# Development branch (if supported by your installer)
npx skills add CCandle/product-design --ref refactor/product-visual-design-trim
```

---

## Capabilities

| Capability | Deliverable |
|------------|-------------|
| Product visuals | HTML page, cover image, hero section |
| Slide decks / HTML deck | Browser presentation + PDF/PPTX export |
| UI mockup (App/Web) | Device-framed HTML, clickable prototype |
| Commercial pages | Landing section, feature comparison, product intro |
| Infographic / layout | CSS Grid precision layouts, printable |
| Design direction exploration | 2-3 visual direction variants |
| Design review | 5-dimension scoring + Keep/Fix/Quick Wins |

### Example prompts

```
"Create a product intro PPT for an AI tool, show 2-3 style directions"
"Build an iOS Pomodoro app prototype, 4 interactive screens"
"Design a project cover, technical feel"
"Create a feature comparison infographic"
"Run a 5-dimension design review on this"
"Check this page for AI slop"
```

---

## What it does NOT do

- ❌ **Video / animation export** — no MP4/GIF/ffmpeg, no launch film, no BGM/SFX
- ❌ **Voiceover / TTS / narration** — no voice pipeline, no subtitles
- ❌ **Engineering schematics** — no circuit diagrams, PCB, wiring
- ❌ **Scientific figures** — no Nature-style multi-panel figure
- ❌ **Production web apps** — no backend, no SEO site, no full frontend engineering

---

## Core principles

### Design context first

Good design grows from existing context. Ask for brand guidelines, logos, UI screenshots, reference pages before starting. No context? State assumptions and offer 2-3 directions.

### Brand asset protocol

When a real brand appears, collect real assets (logo, product photos, UI screenshots, color palette, typefaces). Never fake a logo or product image. Never fabricate assets for visual convenience.

### Anti-AI-slop

No purple-blue gradients, no emoji-as-icons, no rounded-cards-with-left-border, no SVG-drawn faces, no fabricated stats. Every design rule has a rationale — it's about protecting brand recognition, not aesthetic purity.

### Honest placeholders

Missing real images? Label as placeholder. Missing real data? Label as "pending." An honest placeholder is 10x better than a bad fake.

---

## File structure

```
product-visual-design/
├── SKILL.md                 # Main agent prompt
├── README.md                # Chinese README
├── README.en.md             # This file
├── package.json             # Dependencies: playwright / pptxgenjs / pdf-lib / sharp
├── assets/                  # Starter Components
├── references/              # Task-specific deep references
├── scripts/                 # PDF/PPTX export, screenshot verification
└── archive/
    ├── legacy-demos/        # Archived demos (visual reference only)
    └── legacy-references/   # Old video-heavy references, not active skill scope
```

---

## License

MIT — free to use, modify, distribute, including commercial use.
