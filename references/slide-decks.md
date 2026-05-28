# Slide Decks: HTML Slide Production Conventions

Making slide decks is a high-frequency design task. This document explains how to make HTML slide decks well — from architecture choice and per-page design through to the full PDF/PPTX export path.

**Capabilities this skill covers**:
- **HTML presentation version (the base artifact — always the default, always required)** → one HTML file per slide + `assets/deck_index.html` aggregator, keyboard navigation in the browser, full-screen presenting
- HTML → PDF export → `scripts/export_deck_pdf.mjs` / `scripts/export_deck_stage_pdf.mjs`
- HTML → editable PPTX export → `references/editable-pptx.md` + `scripts/html2pptx.js` + `scripts/export_deck_pptx.mjs` (requires HTML to be written to the 4 hard constraints)

> **⚠️ HTML is the base, PDF/PPTX are derivatives.** No matter what the final delivery format is, you **must** first make the HTML aggregated presentation (`index.html` + `slides/*.html`) — it's the "source" of the slide deck. PDF/PPTX are one-line-command snapshots exported from the HTML.
>
> **Why HTML first**:
> - Best for live presenting (projector / shared screen full-screens directly, keyboard navigation, no dependency on Keynote/PPT software)
> - During development you can double-click each page on its own to verify, no need to re-run export each time
> - It is the only upstream of the PDF/PPTX export (avoiding the "after export I discover I have to change the HTML and re-export" loop)
> - The deliverable can be "HTML + PDF" or "HTML + PPTX" in pairs — the recipient uses whichever they prefer
>
> 2026-04-22 moxt brochure verification: after finishing 13 pages of HTML + index.html aggregation, one line of `export_deck_pdf.mjs` exported the PDF with zero modifications. The HTML version itself is a deliverable that can be presented directly in the browser.

---

## 🛑 Confirm Delivery Format Before You Start (the hardest checkpoint)

**This decision comes even earlier than "single file or multi-file".** Verified in the 2026-04-20 options-roundtable project: **failing to confirm delivery format before starting = 2-3 hours of rework.**

### Decision Tree (HTML-first architecture)

Every delivery starts from the same HTML aggregation page (`index.html` + `slides/*.html`). The delivery format only determines the **constraints on how to write the HTML** and the **export command**:

```
[Always default · always required] HTML aggregated presentation (index.html + slides/*.html)
   │
   ├── Just need browser presenting / local HTML archive   → done here, maximum HTML visual freedom
   │
   ├── Also need PDF (print / send / archive)              → run export_deck_pdf.mjs, one-shot
   │                                                          HTML free-form, no visual constraint
   │
   └── Also need editable PPTX (colleagues will edit text) → write HTML to the 4 hard constraints from line 1
                                                              run export_deck_pptx.mjs, one-shot
                                                              sacrifice gradients / web component / complex SVG
```

### Kickoff Script (copy and use)

> Regardless of whether the final delivery is HTML, PDF, or PPTX, I'll first make an HTML aggregated version (`index.html` plus keyboard navigation) that you can switch through and present in the browser — this is always the default base artifact. On top of that, I'll then ask whether you also want a PDF / PPTX snapshot.
>
> Which export format do you need?
> - **HTML only** (presenting/archive) → fully free visually
> - **Also PDF** → same as above, plus one export command
> - **Also editable PPTX** (a colleague will edit text inside PPT) → I have to write the HTML to the 4 hard constraints from the very first line, which sacrifices some visual capabilities (no gradients, no web components, no complex SVG).

### Why "if you want PPTX you have to go through the 4 hard constraints from the start"

For PPTX to be editable, `html2pptx.js` has to translate the DOM into PowerPoint objects element-by-element. That requires **4 hard constraints**:

1. body fixed at 960pt × 540pt (matches `LAYOUT_WIDE`, 13.333″ × 7.5″, not 1920×1080px)
2. All text wrapped in `<p>`/`<h1>`-`<h6>` (no text directly in a div, no `<span>` carrying the main text)
3. `<p>`/`<h*>` cannot have background/border/shadow on themselves (put it on the outer div)
4. `<div>` cannot use `background-image` (use an `<img>` tag)
5. No CSS gradient, no web component, no complex SVG decoration

**This skill's default HTML has high visual freedom** — lots of spans, nested flex, complex SVG, web components (like `<deck-stage>`), CSS gradients — **almost none of which naturally passes html2pptx's constraints** (in practice, visual-driven HTML sent straight through html2pptx has a pass rate < 30%).

### Cost Comparison of the Two Real Paths (2026-04-20 real pitfall)

| Path | Approach | Result | Cost |
|------|------|------|------|
| ❌ **Write HTML freely first, retrofit PPTX later** | Single-file deck-stage + heavy SVG/span decoration | Only two paths left to get editable PPTX:<br>A. Hand-write hundreds of lines of pptxgenjs with hardcoded coordinates<br>B. Rewrite 17 pages of HTML into Path A format | 2-3 hours of rework, and the hand-written version has **perpetual maintenance cost** (change one word in the HTML and you have to manually re-sync the PPTX) |
| ✅ **Write to Path A constraints from step one** | Per-page independent HTML + 4 hard constraints + 960×540pt | One command exports a 100% editable PPTX, and the same HTML can be full-screen presented in the browser (Path A HTML is just standard browser-playable HTML) | 5 extra minutes thinking "how do I wrap this text in a `<p>`" while writing HTML, zero rework |

### What about mixed delivery

The user says "I want both HTML presenting **and** editable PPTX" — **this isn't mixed**, it's PPTX requirements subsuming HTML requirements. HTML written to Path A is itself browser-presentable full-screen (just add a `deck_index.html` aggregator). **No extra cost.**

The user says "I want PPTX **and** animation / web components" — **this is a real conflict**. Tell the user: for editable PPTX you have to sacrifice those visual capabilities. Make them choose — don't quietly take the hand-written pptxgenjs path (which becomes permanent maintenance debt).

### What to Do if PPTX Need Surfaces After the Fact (emergency fallback)

Rare case: the HTML is already written and only then you learn PPTX is needed. Take the **fallback flow** (full explanation at the end of `references/editable-pptx.md` under "Fallback: Visual Mock Already Exists but the User Insists on Editable PPTX"):

1. **First choice: ship a PDF** (visual preserved 100%, cross-platform, recipient can view and print) — if the recipient's actual need is "present/archive", PDF is the best deliverable
2. **Second choice: AI uses the visual mock as a blueprint and rewrites an editable HTML** → exports an editable PPTX — preserves the design decisions for color / layout / copy, sacrifices visual capabilities like gradients, web components, complex SVG
3. **Not recommended: hand-write pptxgenjs to rebuild** — position, font, alignment all need manual tweaking, high maintenance cost, and each future word change in the HTML still has to be manually re-synced

Always tell the user the choices and let them decide. **Never make the first response be "let's hand-write pptxgenjs"** — that's the last-resort fallback.

---

## 🛑 Before Mass Producing: Build 2 Showcase Pages to Fix the Grammar

**Whenever a deck has ≥ 5 pages, absolutely do not write page 1 straight through to the last page.** The correct order verified in the 2026-04-22 moxt brochure run:

1. Pick **the 2 page types with the largest visual difference** and make them as showcase first (e.g. "cover" + "mood/quote page", or "cover" + "product showcase page")
2. Screenshot them and have the user confirm the grammar (masthead / fonts / colors / spacing / structure / bilingual ratio)
3. Once the direction is approved, batch out the remaining N-2 pages, each reusing the established grammar
4. After all pages are done, compose them together into the HTML aggregation + PDF / PPTX derivatives

**Why**: writing 13 pages straight through → user says "wrong direction" = 13 pages of rework. Build 2 showcase pages first → wrong direction = 2 pages of rework. Once the visual grammar is set, the decision space for the remaining N pages collapses sharply, leaving only "how does the content fit in".

**Principle for picking showcase pages**: pick the two with the most different visual structure. If those two pass = all the intermediate ones will pass.

| Deck type | Recommended showcase pair |
|-----------|---------------------|
| B2B brochure / product launch | Cover + content page (philosophy / emotion page) |
| Brand launch | Cover + product feature page |
| Data report | Big-number data page + analysis/conclusion page |
| Lesson / courseware | Chapter cover + specific knowledge point page |

---

## 📐 Publication Grammar Template (moxt-verified, reusable)

Suitable for B2B brochures / product launches / long-form report decks. Reusing this structure across every page = 13 pages visually consistent, zero rework.

### Per-page skeleton

```
┌─ masthead (top strip + horizontal rule) ──────────┐
│  [logo 22-28px] · A Product Brochure                Issue · Date · URL │
├──────────────────────────────────────────┤
│                                          │
│  ── kicker (green short dash + uppercase label) │
│  CHAPTER XX · SECTION NAME                 │
│                                          │
│  H1 (Chinese Noto Serif SC 900)           │
│  Key word in brand primary color          │
│                                          │
│  English subtitle (Lora italic)           │
│  ─────────── divider rule ──────────      │
│                                          │
│  [actual content: 60/40 two-column / 2x2 grid / list] │
│                                          │
├──────────────────────────────────────────┤
│ section name                     XX / total │
└──────────────────────────────────────────┘
```

### Style conventions (copy and use)

- **H1**: Chinese Noto Serif SC 900, font size 80-140px based on information density; key words colored in the brand primary (don't smear color across the whole text)
- **English subtitle**: Lora italic 26-46px; brand signature phrases (e.g. "AI team") bold + primary-color italic
- **Body**: Noto Serif SC 17-21px, line-height 1.75-1.85
- **Accent highlight**: in body text, bold + primary-color the key words; no more than 3 per page (more and the anchoring effect is lost)
- **Background**: warm off-white #FAFAFA + an extremely faint radial-gradient noise (`rgba(33,33,33,0.015)`) for paper feel

### The visual lead must differ across pages

If all 13 pages are "text + one screenshot" it's monotonous. **Rotate the type of visual lead per page**:

| Visual type | Suitable section |
|---------|---------------|
| Cover typography (big type + masthead + pillar) | Front page / chapter cover |
| Single-character portrait (one giant momo etc.) | Introducing a single concept / character |
| Group shot / avatar cards side by side | Team / customer cases |
| Timeline cards progressing | Showing "long-term relationship" / "evolution" |
| Knowledge graph / connection node diagram | Showing "collaboration" / "flow" |
| Before/After comparison cards + arrow in between | Showing "change" / "difference" |
| Product UI screenshot + outlined device frame | Specific feature showcase |
| Big-quote (half-page big text) | Emotion page / question page / quote page |
| Real-person avatar + quote card (2×2 or 1×4) | User testimonial / use-case scene |
| Big-type closing + URL pill button | CTA / closing |

---

## ⚠️ Common Pitfalls (moxt practical takeaways)

### 1. Emojis don't render under Chromium / Playwright export

Chromium doesn't ship with a color emoji font by default — `page.pdf()` or `page.screenshot()` renders emojis as empty boxes.

**Mitigation**: use Unicode text symbols (`✦` `✓` `✕` `→` `·` `—`) instead, or just plain text ("Email · 23" instead of "📧 23 emails").

### 2. `export_deck_pdf.mjs` errors with `Cannot find package 'playwright'`

Cause: ESM module resolution walks upward from the script's location to find `node_modules`. The script lives at `~/.claude/skills/huashu-design/scripts/`, which has no dependencies.

**Mitigation**: copy the script into the deck project directory (e.g. `brochure/build-pdf.mjs`), run `npm install playwright pdf-lib` at the project root, then `node build-pdf.mjs --slides slides --out output/deck.pdf`.

### 3. Google Fonts haven't loaded by the time of screenshot → Chinese falls back to the system default

Before Playwright takes a screenshot/PDF, give it at least `wait-for-timeout=3500` so the webfont can download and paint. Or self-host the fonts under `shared/fonts/` to reduce network dependency.

### 4. Information density imbalance: cramming too much into a content page

The first version of the moxt philosophy page used 2×2 = 4 sections + 3 closing tenets at the bottom = 7 chunks of content, cramped and repetitive. Switching to 1×3 = 3 sections immediately restored breathing room.

**Mitigation**: keep each page to "1 core message + 3-4 supporting points + 1 visual lead"; if it exceeds that, split into a new page. **Better empty than padded** — the audience looks at a page for 10 seconds, giving them 1 memory anchor is easier to retain than 4.

---

## 🛑 First Decide the Architecture: Single File or Multi-File?

**This choice is the first step of making slides — get it wrong and you'll trip repeatedly. Finish reading this section before you start.**

### Comparison of the two architectures

| Dimension | Single file + `deck_stage.js` | **Multi-file + `deck_index.html` aggregator** |
|------|--------------------------|--------------------------------------|
| Code structure | One HTML; every slide is a `<section>` | One HTML per slide; `index.html` aggregates via iframes |
| CSS scope | ❌ Global — one page's style can affect every page | ✅ Naturally isolated — each iframe is its own world |
| Verification grain | ❌ Have to JS `goTo` to switch to a slide | ✅ Double-click a single file and view in browser |
| Parallel development | ❌ One file — multiple agents editing collides | ✅ Multiple agents can work different pages in parallel, zero merge conflicts |
| Debugging difficulty | ❌ One CSS error flips the whole deck | ✅ A broken page only breaks itself |
| Embedded interaction | ✅ Sharing state across slides is easy | 🟡 iframes need postMessage |
| Print PDF | ✅ Built-in | ✅ Aggregator iterates iframes on beforeprint |
| Keyboard navigation | ✅ Built-in | ✅ Built into the aggregator |

### Which to pick? (decision tree)

```
│ Question: how many slides do you expect?
├── ≤ 10 pages, need in-deck animation or cross-page interaction, pitch deck → single file
└── ≥ 10 pages, lecture, lesson, long deck, multi-agent in parallel  → multi-file (recommended)
```

**Default to the multi-file path.** It is not a "backup", it is **the main path for long decks and team collaboration**. Reason: every advantage of the single-file architecture (keyboard navigation, printing, scaling) the multi-file architecture also has, while the scope isolation and verifiability of the multi-file architecture are things the single-file one can never recover.

### Why this rule is so strict (real incident record)

The single-file architecture once tripped four pitfalls back-to-back while producing the "AI Psychology Lecture" deck:

1. **CSS specificity override**: `.emotion-slide { display: grid }` (specificity 10) defeated `deck-stage > section { display: none }` (specificity 2), causing every page to render simultaneously, stacked.
2. **Shadow DOM slot rules suppressed by outer CSS**: `::slotted(section) { display: none }` couldn't hold off an outer-rule override; sections refused to hide.
3. **localStorage + hash navigation race**: after a refresh, instead of jumping to the hash position, it stayed at the old position recorded in localStorage.
4. **Verification cost was high**: had to `page.evaluate(d => d.goTo(n))` to screenshot a slide, twice as slow as `goto(file://.../slides/05-X.html)` directly, and often errored.

The root cause for all of them is **a single global namespace** — the multi-file architecture eliminates these problems at the physical layer.

---

## Path A (default): Multi-file architecture

### Directory layout

```
My Deck/
├── index.html              # copied from assets/deck_index.html, MANIFEST updated
├── shared/
│   ├── tokens.css          # shared design tokens (palette / type scale / common chrome)
│   └── fonts.html          # Google Fonts <link>s (each page includes)
└── slides/
    ├── 01-cover.html       # each file is a complete 1920×1080 HTML
    ├── 02-agenda.html
    ├── 03-problem.html
    └── ...
```

### Per-slide template skeleton

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>P05 · Chapter Title</title>
<link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
<link rel="stylesheet" href="../shared/tokens.css">
<style>
  /* Styles unique to this slide. Any class name is safe — it won't pollute other slides. */
  body { padding: 120px; }
  .my-thing { ... }
</style>
</head>
<body>
  <!-- 1920×1080 content (body width/height locked in tokens.css) -->
  <div class="page-header">...</div>
  <div>...</div>
  <div class="page-footer">...</div>
</body>
</html>
```

**Key constraints**:
- `<body>` is the canvas — lay out directly on it. Don't wrap with `<section>` or other wrappers.
- `width: 1920px; height: 1080px` is locked by the `body` rule in `shared/tokens.css`.
- Reference `shared/tokens.css` for shared design tokens (palette, type scale, page-header/footer, etc.).
- Each page writes its own font `<link>` (importing fonts independently isn't expensive, and it guarantees every page is independently openable).

### Aggregator: `deck_index.html`

**Copy it directly from `assets/deck_index.html`.** You only need to change one thing — the `window.DECK_MANIFEST` array, listing every slide file in order with a human-readable label:

```js
window.DECK_MANIFEST = [
  { file: "slides/01-cover.html",    label: "Cover" },
  { file: "slides/02-agenda.html",   label: "Agenda" },
  { file: "slides/03-problem.html",  label: "Problem Statement" },
  // ...
];
```

The aggregator already has built-in: keyboard navigation (←/→/Home/End/number keys/P print), scale + letterbox, bottom-right counter, localStorage memory, hash jump, print mode (iterates iframes to output PDF page by page).

### Per-page verification (the killer advantage of multi-file)

Every slide is an independent HTML. **After finishing one, just double-click it open in the browser**:

```bash
open slides/05-personas.html
```

Playwright screenshots also `goto(file://.../slides/05-personas.html)` directly — no JS navigation, no interference from other pages' CSS. This drives the cost of "tweak one thing, verify one thing" to near zero.

### Parallel development

Hand out each slide as a task to a different agent and run them in parallel — the HTML files are independent of each other and merge with no conflicts. For long decks, this kind of parallelism cuts the production time to 1/N.

### What to put in `shared/tokens.css`

Only **things actually shared across pages**:

- CSS variables (palette, type scale, spacing scale)
- Canvas locking like `body { width: 1920px; height: 1080px; }`
- Chrome that every page uses identically — `.page-header` / `.page-footer`

**Do not** put per-page layout classes here — that degrades back into the single-file architecture's global pollution problem.

---

## Path B (small decks): Single file + `deck_stage.js`

For decks ≤ 10 pages, or that need cross-page shared state (e.g. one React tweaks panel controlling all pages), or pitch-deck demos that demand maximum compactness.

### Basic usage

1. Read the contents of `assets/deck_stage.js` and embed in the HTML's `<script>` (or `<script src="deck_stage.js">`)
2. Wrap slides with `<deck-stage>` inside body
3. 🛑 **The script tag must come after `</deck-stage>`** (see the hard constraint below)

```html
<body>

  <deck-stage>
    <section>
      <h1>Slide 1</h1>
    </section>
    <section>
      <h1>Slide 2</h1>
    </section>
  </deck-stage>

  <!-- ✅ Correct: script comes after deck-stage -->
  <script src="deck_stage.js"></script>

</body>
```

### 🛑 Script Position Hard Constraint (2026-04-20 real pitfall)

**You cannot put `<script src="deck_stage.js">` in the `<head>`.** Even if it can define `customElements` from `<head>`, the parser triggers `connectedCallback` the moment it parses the `<deck-stage>` start tag — at that point the child `<section>`s haven't been parsed yet, `_collectSlides()` gets an empty array, the counter shows `1 / 0`, and every page renders stacked together.

**Three compliant ways to write it** (any one is fine):

```html
<!-- ✅ Most recommended: script after </deck-stage> -->
</deck-stage>
<script src="deck_stage.js"></script>

<!-- ✅ Also fine: script in head but with defer -->
<head><script src="deck_stage.js" defer></script></head>

<!-- ✅ Also fine: module scripts defer naturally -->
<head><script src="deck_stage.js" type="module"></script></head>
```

`deck_stage.js` itself has a built-in `DOMContentLoaded`-delayed collection defense, so even putting the script in head won't blow up completely — but `defer` or bottom-of-body is still the cleaner approach, avoiding reliance on the defensive branch.

### ⚠️ The Single-File Architecture's CSS Trap (must read)

The most common pitfall of the single-file architecture — **the `display` property gets stolen by per-page styles**.

Common wrong posture 1 (writing display: flex straight on section):

```css
/* ❌ Outer CSS specificity 2 overrides the shadow DOM's ::slotted(section){display:none} (also 2) */
deck-stage > section {
  display: flex;            /* every page renders simultaneously, stacked! */
  flex-direction: column;
  padding: 80px;
  ...
}
```

Common wrong posture 2 (section has a higher-specificity class):

```css
.emotion-slide { display: grid; }   /* specificity: 10, worse */
```

Both make **every slide render simultaneously, stacked** — the counter may say `1 / 10` and look fine, but visually slide 1 is on top of slide 2 on top of slide 3.

### ✅ Starter CSS (copy at kickoff, no pitfalls)

**section itself** only handles "visible/invisible"; **layout (flex/grid etc.) is written on `.active`**:

```css
/* section defines only non-display generic styles */
deck-stage > section {
  background: var(--paper);
  padding: 80px 120px;
  overflow: hidden;
  position: relative;
  /* ⚠️ Do not write display here! */
}

/* Lock "non-active is hidden" — specificity + weight, double-safe */
deck-stage > section:not(.active) {
  display: none !important;
}

/* Active page writes the needed display + layout */
deck-stage > section.active {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Print mode: all pages must show, overriding :not(.active) */
@media print {
  deck-stage > section { display: flex !important; }
  deck-stage > section:not(.active) { display: flex !important; }
}
```

Alternative: **write the per-page flex/grid onto an inner wrapper `<div>`**, so the section itself is forever just a `display: block/none` switch. This is the cleanest approach:

```html
<deck-stage>
  <section>
    <div class="slide-content flex-layout">...</div>
  </section>
</deck-stage>
```

### Custom dimensions

```html
<deck-stage width="1080" height="1920">
  <!-- 9:16 portrait -->
</deck-stage>
```

---

## Slide Labels

Both deck_stage and deck_index label every page (the counter shows it). Give them **more meaningful** labels:

**Multi-file**: in `MANIFEST` write `{ file, label: "04 Problem Statement" }`
**Single-file**: add to the section `<section data-screen-label="04 Problem Statement">`

**Key: slide numbering starts at 1, not 0**.

When the user says "slide 5", they mean the 5th slide — never the array position `[4]`. Humans don't speak 0-indexed.

---

## Speaker Notes

**Don't add them by default** — only when the user explicitly asks.

Once you add speaker notes, you can cut the on-slide text to a minimum and focus on impactful visuals — the notes carry the full script.

### Format

**Multi-file**: in `index.html`'s `<head>`, write:

```html
<script type="application/json" id="speaker-notes">
[
  "Script for slide 1...",
  "Script for slide 2...",
  "..."
]
</script>
```

**Single-file**: same location.

### Speaker Notes Writing Principles

- **Complete**: not an outline — the actual words you'll say
- **Conversational**: spoken language, not written
- **Aligned**: the Nth entry corresponds to the Nth slide
- **Length**: 200-400 words is the sweet spot
- **Emotional line**: mark stresses, pauses, emphases

---

## Slide Design Patterns

### 1. Establish a system (mandatory)

After exploring the design context, **state the system you're going to use, out loud first**:

```markdown
Deck system:
- Background colors: at most 2 (90% white + 10% dark section divider)
- Type: display uses Instrument Serif, body uses Geist Sans
- Rhythm: section dividers use full-bleed color + white type; normal slides are white background
- Imagery: hero slides use full-bleed photo, data slides use chart

I'll proceed under this system — flag anything off.
```

Proceed only after the user confirms.

### 2. Common slide layouts

- **Title slide**: solid background + giant title + subtitle + author/date
- **Section divider**: colored background + section number + section title
- **Content slide**: white background + title + 1-3 bullet points
- **Data slide**: title + big chart/number + brief explanation
- **Image slide**: full-bleed photo + small bottom caption
- **Quote slide**: whitespace + giant quote + attribution
- **Two-column**: left/right comparison (vs / before-after / problem-solution)

Use at most 4-5 layouts in one deck.

### 3. Scale (saying it again)

- Body minimum **24px**, ideal 28-36px
- Title **60-120px**
- Hero type **180-240px**
- Slides are seen from 10 meters away — the type must be big enough

### 4. Visual rhythm

A deck needs **intentional variety**:

- Color rhythm: mostly white background + occasional colored section divider + occasional dark stretch
- Density rhythm: a few text-heavy + a few image-heavy + a few quote whitespace
- Type-size rhythm: normal titles + the occasional giant hero text

**Don't make every slide look the same** — that's a PPT template, not design.

### 5. Breathing room (must read for data-dense pages)

**The pitfall beginners stomp on most**: cramming every fact you have into one page.

Information density ≠ effective information transfer. Academic/lecture decks especially need restraint:

- List / matrix page: don't draw every one of the N elements at the same size. Use **a primary/secondary hierarchy** — enlarge the 5 you're talking about today as the lead, shrink the remaining 16 as background hints.
- Big-number page: the number itself is the visual lead. Surrounding captions should not exceed 3 lines, or the audience's eyes ping-pong.
- Quote page: leave whitespace between the quote and the attribution; don't stick them together.

Self-audit against "is the data the lead" and "is the text crammed together" — keep cutting until the whitespace makes you slightly uncomfortable.

---

## Printing to PDF

**Multi-file**: `deck_index.html` already handles `beforeprint` and outputs PDF page by page.

**Single-file**: `deck_stage.js` does the same.

The print styles are already written — no need to add additional `@media print` CSS.

---

## Exporting to PPTX / PDF (self-service scripts)

HTML-first is the first-class citizen. But users often need PPTX/PDF delivery. Two generic scripts are provided, **usable for any multi-file deck**, under `scripts/`:

### `export_deck_pdf.mjs` — Export Vector PDF (multi-file architecture)

```bash
node scripts/export_deck_pdf.mjs --slides <slides-dir> --out deck.pdf
```

**Properties**:
- Text is **preserved as vectors** (selectable, searchable)
- Visual fidelity is 100% (Playwright's embedded Chromium renders then prints)
- **No HTML changes required**
- Each slide runs its own `page.pdf()`, then merged with `pdf-lib`

**Dependencies**: `npm install playwright pdf-lib`

**Limitation**: text in PDF can no longer be edited — go back to HTML to edit.

### `export_deck_stage_pdf.mjs` — Single-file deck-stage architecture only ⚠️

**When to use**: the deck is a single HTML file + a `<deck-stage>` web component wrapping N `<section>`s (i.e. Path B architecture). In this case, the "one `page.pdf()` per HTML" approach of `export_deck_pdf.mjs` doesn't work — you need this dedicated script.

```bash
node scripts/export_deck_stage_pdf.mjs --html deck.html --out deck.pdf
```

**Why you can't reuse export_deck_pdf.mjs** (2026-04-20 real pitfall record):

1. **Shadow DOM wins over `!important`**: deck-stage's shadow CSS has `::slotted(section) { display: none }` (only the active one gets `display: block`). Even adding `@media print { deck-stage > section { display: block !important } }` in the light DOM can't override it — once `page.pdf()` triggers print media, Chromium's final render only contains the active slide, so **the entire PDF is just 1 page** (the current active slide, repeated).

2. **Looping `goto` per page still produces just 1 page**: the intuitive fix "navigate to each `#slide-N` then `page.pdf({pageRanges:'1'})`" also fails — because once the print CSS's `deck-stage > section { display: block }` rule outside the shadow DOM gets overridden, the final render is always the first section in the list (not the one you navigated to). The result: 17 loops produce 17 P01 covers.

3. **Absolute children spill onto the next page**: even after successfully rendering all sections, if the section itself is `position: static`, its absolute-positioned `cover-footer`/`slide-footer` will be positioned relative to the initial containing block — when print forces the section to 1080px height, the absolute footer can be pushed onto the next page (the PDF ends up with one more page than there are sections, the extra page containing an orphaned footer).

**Fix strategy** (the script implements this):

```js
// After opening the HTML, use page.evaluate to lift sections out of the deck-stage slot
// and mount them under a plain div on body, inlining styles to ensure position:relative + fixed size
await page.evaluate(() => {
  const stage = document.querySelector('deck-stage');
  const sections = Array.from(stage.querySelectorAll(':scope > section'));
  document.head.appendChild(Object.assign(document.createElement('style'), {
    textContent: `
      @page { size: 1920px 1080px; margin: 0; }
      html, body { margin: 0 !important; padding: 0 !important; }
      deck-stage { display: none !important; }
    `,
  }));
  const container = document.createElement('div');
  sections.forEach(s => {
    s.style.cssText = 'width:1920px!important;height:1080px!important;display:block!important;position:relative!important;overflow:hidden!important;page-break-after:always!important;break-after:page!important;background:#F7F4EF;margin:0!important;padding:0!important;';
    container.appendChild(s);
  });
  // Disable page break on the last page to avoid a trailing blank page
  sections[sections.length - 1].style.pageBreakAfter = 'auto';
  sections[sections.length - 1].style.breakAfter = 'auto';
  document.body.appendChild(container);
});

await page.pdf({ width: '1920px', height: '1080px', printBackground: true, preferCSSPageSize: true });
```

**Why this works**:
- Lifting sections out of the shadow-DOM slot into a plain div in the light DOM completely bypasses the `::slotted(section) { display: none }` rule
- Inline `position: relative` makes absolute children position relative to the section, so they don't overflow
- `page-break-after: always` makes the browser put each section on its own page when printing
- `:last-child` no-break avoids the trailing blank page

**When verifying with `mdls -name kMDItemNumberOfPages`, note**: macOS Spotlight metadata is cached — after rewriting a PDF you must run `mdimport file.pdf` to force a refresh, otherwise it shows the old page count. The real count comes from `pdfinfo` or counting files from `pdftoppm`.

---

### `export_deck_pptx.mjs` — Export Editable PPTX

```bash
# Sole mode: text frames natively editable (fonts fall back to system fonts)
node scripts/export_deck_pptx.mjs --slides <dir> --out deck.pptx
```

How it works: `html2pptx` walks the DOM, reads computedStyle, and translates elements into PowerPoint objects (text frame / shape / picture). Text becomes real text frames — double-click to edit in PPT.

**Hard constraints** (HTML must meet them or the page is skipped; full explanation in `references/editable-pptx.md`):
- All text must be inside `<p>`/`<h1>`-`<h6>`/`<ul>`/`<ol>` (no raw text in divs)
- `<p>`/`<h*>` tags can't have background/border/shadow on themselves (put it on the outer div)
- Don't insert decorative text with `::before`/`::after` (pseudo-elements can't be extracted)
- Inline elements (span/em/strong) can't have margin
- No CSS gradients (cannot be rendered)
- divs cannot use `background-image` (use `<img>`)

The script has a built-in **auto preprocessor** — it automatically wraps "raw text inside leaf divs" in `<p>` (keeping the class). This solves the most common violation (raw text). Other violations (border on p, margin on span, etc.) still require the HTML source to be compliant.

**Font fallback caveat**:
- Playwright uses webfonts to measure text-box dimensions; PowerPoint/Keynote uses the local machine's fonts to render
- When they differ, you get **overflow or misalignment** — eyeball every page
- Either install the HTML's fonts on the target machine, or fall back to `system-ui`

**Don't take this path for visual-priority scenarios** → use `export_deck_pdf.mjs` to ship a PDF instead. PDF is 100% visually faithful, vector, cross-platform, and its text is searchable — it's the true home of a visual-priority deck, not some "non-editable compromise".

### Make the HTML Export-Friendly From the Start

For the steadiest deck performance: **write the HTML to the 4 editable hard constraints from day one**. That way `export_deck_pptx.mjs` will pass everything in one shot. The extra cost is small:

```html
<!-- ❌ Bad -->
<div class="title">Key finding</div>

<!-- ✅ Good (wrapped in p, class inherited) -->
<p class="title">Key finding</p>

<!-- ❌ Bad (border on the p) -->
<p class="stat" style="border-left: 3px solid red;">41%</p>

<!-- ✅ Good (border on the outer div) -->
<div class="stat-wrap" style="border-left: 3px solid red;">
  <p class="stat">41%</p>
</div>
```

### Which to pick when

| Scenario | Recommendation |
|------|------|
| For the host / archival | **PDF** (universal, high-fidelity, searchable text) |
| Sending to collaborators for them to tweak text | **PPTX editable** (accept font fallback) |
| For live presenting, no content changes | **PDF** (vector fidelity, cross-platform) |
| HTML is the primary presentation medium | Play in browser directly — export is just a backup |

## The Deeper Editable-PPTX Path (for long-term projects only)

If your deck will be maintained long-term, edited repeatedly, with team collaboration — **write the HTML to the html2pptx constraints from the very start**, so `export_deck_pptx.mjs` passes everything in one go. See `references/editable-pptx.md` (4 hard constraints + HTML template + common-error quick reference + fallback flow for existing visual mocks).

---

## Common Issues

**Multi-file: an iframe page won't open / shows blank**
→ Check the `MANIFEST`'s `file` path is correct relative to `index.html`. Use DevTools to check the iframe's src is directly reachable.

**Multi-file: a page's styles conflict with another page**
→ Impossible (iframes isolate). If it feels like a conflict, it's the cache — Cmd+Shift+R hard refresh.

**Single-file: multiple slides render stacked**
→ CSS specificity issue. See "The Single-File Architecture's CSS Trap" above.

**Single-file: scaling looks wrong**
→ Check that every slide hangs directly under `<deck-stage>` as `<section>`. There must be no `<div>` in between.

**Single-file: want to jump to a specific slide**
→ Add a URL hash: `index.html#slide-5` jumps to slide 5.

**Both architectures: text positions are inconsistent across screens**
→ Use fixed dimensions (1920×1080) and `px` units, not `vw`/`vh` or `%`. Scaling is handled uniformly.

---

## Validation Checklist (must pass after finishing the deck)

1. [ ] Open `index.html` (or the main HTML) directly in the browser — confirm the first page has no broken images and fonts have loaded
2. [ ] Press → to advance through every slide — no blank pages, no layout breakage
3. [ ] Press P for print preview — each page is exactly one A4 (or 1920×1080) with no clipping
4. [ ] Hard refresh (Cmd+Shift+R) 3 random pages — localStorage memory still works
5. [ ] Playwright batch screenshots (multi-file: iterate `slides/*.html`; single-file: switch via goTo) — eyeball every one
6. [ ] Search for `TODO` / `placeholder` leftovers — confirm they're all cleaned up
