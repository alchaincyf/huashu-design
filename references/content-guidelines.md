# Content Guidelines: Anti-AI-Slop, Content Rules, Scale Spec

The traps AI design falls into most easily. This is a "what not to do" list — more important than "what to do", because AI slop is the default, and if you don't actively avoid it, it happens.

## Complete AI Slop Blacklist

### Visual Traps

**❌ Aggressive gradient backgrounds**
- Purple → pink → blue full-screen gradient (the classic AI-generated webpage flavor)
- Rainbow gradient in any direction
- Mesh gradient covering the whole background
- ✅ If you must use a gradient: subtle, single hue, intentionally placed (e.g., button hover)

**❌ Rounded card + left border accent color**
```css
/* The signature look of an AI-flavored card */
.card {
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  padding: 16px;
}
```
This card style is everywhere in AI-generated dashboards. Want emphasis? Use a more design-forward approach: background color contrast, weight / size contrast, plain dividers, or just drop the card altogether.

**❌ Emoji decoration**
Unless the brand itself uses emoji (e.g., Notion, Slack), don't put emoji in UI. **Especially don't**:
- 🚀 ⚡️ ✨ 🎯 💡 in front of headings
- ✅ in feature lists
- → inside CTA buttons (a standalone arrow is fine, an emoji arrow isn't)

If you lack an icon, use a real icon library (Lucide / Heroicons / Phosphor), or a placeholder.

**❌ Drawing imagery in SVG**
Don't try to draw people, scenes, devices, objects, or abstract art in SVG. AI-drawn SVG imagery screams AI on sight — naive and cheap. **A gray rectangle plus the text "illustration slot 1200×800" beats a clumsy SVG hero illustration 100×**.

The only scenarios where SVG is fine:
- Actual icons (16×16 to 32×32 scale)
- Geometric shapes as decorative elements
- Data viz charts

**❌ Excess iconography**
Not every heading / feature / section needs an icon. Overused icons make the UI feel like a toy. Less is more.

**❌ "Data slop"**
Fabricated stats as decoration:
- "10,000+ happy customers" (you don't even know if it's true)
- "99.9% uptime" (don't write it without real numbers)
- Decorative "metric cards" of icon + number + word
- Fake data dressed up gaudily in mock tables

If you have no real data, leave a placeholder or ask the user.

**❌ "Quote slop"**
Fabricated user testimonials and celebrity quotes used as decoration. Leave a placeholder and ask the user for real quotes.

### Type Traps

**❌ Avoid these cliché fonts**:
- Inter (AI-generated webpage default)
- Roboto
- Arial / Helvetica
- Pure system font stack
- Fraunces (AI found it and ran it into the ground)
- Space Grotesk (recent AI favorite)

**✅ Use a distinctive display + body pairing**. Directions:
- Serif display + sans body (editorial feel)
- Mono display + sans body (technical feel)
- Heavy display + light body (contrast)
- Variable font animating weight in the hero

Font sources:
- Underrated Google Fonts options (Instrument Serif, Cormorant, Bricolage Grotesque, JetBrains Mono)
- Open-source font sites (Fraunces' siblings, Adobe Fonts)
- Don't invent font names from thin air

### Color Traps

**❌ Inventing colors from a blank slate**
Don't design a full unfamiliar palette from scratch. It usually doesn't harmonize.

**✅ Strategy**:
1. Have a brand color → use it, interpolate missing color tokens with oklch
2. No brand color but have references → pick colors from reference product screenshots
3. Fully from scratch → pick a known color system (Radix Colors / Tailwind default palette / Anthropic brand), don't roll your own

**Defining color with oklch** is the modern way:
```css
:root {
  --primary: oklch(0.65 0.18 25);      /* warm terracotta */
  --primary-light: oklch(0.85 0.08 25); /* same hue, lighter */
  --primary-dark: oklch(0.45 0.20 25);  /* same hue, darker */
}
```
oklch keeps hue stable when you adjust lightness — better than hsl.

**❌ Casually inverting colors for dark mode**
Not a simple color invert. Good dark mode needs re-tuned saturation, contrast, accent colors. Don't want to do dark mode? Don't do it.

### Layout Traps

**❌ Bento grid overload**
Every AI-generated landing page wants a bento. Unless your information structure really suits bento, use another layout.

**❌ Big hero + 3-column features + testimonials + CTA**
This landing page template is worn out. Want to innovate? Actually innovate.

**❌ Card grid where every card looks the same**
Asymmetric, varied sizes, some with images and some text-only, some spanning columns — that's what a real designer's work looks like.

## Content Rules

### 1. Don't add filler content

Every element must earn its place. White space is a design problem solved by **composition** (contrast, rhythm, breathing room), **not** by stuffing it with content.

**Filler test**:
- If removing this content makes the design worse, keep it. If the answer is "no", remove it.
- What real problem does this element solve? If it's "makes the page feel less empty", delete it.
- Is there real data backing this stat / quote / feature? No? Don't fabricate.

"One thousand no's for every yes."

### 2. Ask before adding material

Think one more section / page / paragraph would be better? Ask the user first, don't add unilaterally.

Why:
- The user knows their audience better than you
- Adding content has a cost; the user may not want it
- Adding unilaterally violates the "junior designer reporting to manager" relationship

### 3. Create a system up front

After exploring design context, **state the system you're going to use** verbally and have the user confirm:

```markdown
My design system:
- Color: #1A1A1A body + #F0EEE6 background + #D97757 accent (from your brand)
- Type: Instrument Serif for display + Geist Sans for body
- Rhythm: section titles get a full-bleed colored background with white text; regular sections get white background
- Imagery: full-bleed photo in hero, feature sections get placeholders pending your assets
- At most 2 background colors, to avoid clutter

Confirm and I start building.
```

Move once the user confirms. This check-in prevents "halfway in we realize the direction is wrong".

## Scale Spec

### Slides (1920×1080)

- Body minimum **24px**, ideal 28-36px
- Title 60-120px
- Section title 80-160px
- Hero headline can run 180-240px
- Never use <24px text in slides

### Print Documents

- Body minimum **10pt** (≈13.3px), ideal 11-12pt
- Title 18-36pt
- Caption 8-9pt

### Web and Mobile

- Body minimum **14px** (16px if elderly-friendly)
- Mobile body **16px** (avoids iOS auto-zoom)
- Hit target (clickable element) minimum **44×44px**
- Line height 1.5-1.7 (Chinese 1.7-1.8)

### Contrast

- Body vs background **at least 4.5:1** (WCAG AA)
- Large text vs background **at least 3:1**
- Check with Chrome DevTools' accessibility tool

## CSS Power Tools

**Advanced CSS features** are the designer's best friend — use them boldly:

### Typography

```css
/* Lets headings wrap more naturally, no lonely last-line word */
h1, h2, h3 { text-wrap: balance; }

/* Body text wrap, avoids widows and orphans */
p { text-wrap: pretty; }

/* Power feature for Chinese typesetting: punctuation kerning, line-start/end control */
p {
  text-spacing-trim: space-all;
  hanging-punctuation: first;
}
```

### Layout

```css
/* CSS Grid + named areas = readability through the roof */
.layout {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
  grid-template-columns: 240px 1fr;
  grid-template-rows: auto 1fr auto;
}

/* Subgrid aligns card contents */
.card { display: grid; grid-template-rows: subgrid; }
```

### Visual Effects

```css
/* Designed scrollbars */
* { scrollbar-width: thin; scrollbar-color: #666 transparent; }

/* Glassmorphism (use sparingly) */
.glass {
  backdrop-filter: blur(20px) saturate(150%);
  background: color-mix(in oklch, white 70%, transparent);
}

/* View Transitions API for smooth page transitions */
@view-transition { navigation: auto; }
```

### Interaction

```css
/* :has() selector makes conditional styles easy */
.card:has(img) { padding-top: 0; } /* cards with an image get no top padding */

/* Container queries make components actually responsive */
@container (min-width: 500px) { ... }

/* The new color-mix function */
.button:hover {
  background: color-mix(in oklch, var(--primary) 85%, black);
}
```

## Decision Cheat Sheet: When You Hesitate

- Thinking of adding a gradient? → Probably don't
- Thinking of adding an emoji? → Don't
- Thinking of giving the card a rounded + border-left accent? → Don't, use another approach
- Thinking of drawing a hero illustration in SVG? → Don't, use a placeholder
- Thinking of adding a decorative quote? → Ask the user for a real quote first
- Thinking of adding a row of icon features? → Ask whether icons are needed; maybe not
- Reaching for Inter? → Pick something more distinctive
- Reaching for a purple gradient? → Pick a palette with grounding

**When you feel "adding this would look better" — that's usually the sign of AI slop**. Do the most stripped-down version first, only add when the user asks.
