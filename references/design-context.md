# Design Context: Start from What's Already There

**This is the most important one thing in this skill.**

Good hi-fi design always grows out of existing design context. **Doing hi-fi from a blank slate is a last resort — it will always produce something generic**. So at the start of every design task, ask: is there anything to reference?

## What Counts as Design Context

In priority order, high to low:

### 1. The user's Design System / UI Kit
The user's own product's component library, color tokens, type spec, icon system. **The ideal case**.

### 2. The user's Codebase
If the user provides a codebase, it contains living component implementations. Read those component files:
- `theme.ts` / `colors.ts` / `tokens.css` / `_variables.scss`
- Specific components (Button.tsx, Card.tsx)
- Layout scaffolds (App.tsx, MainLayout.tsx)
- Global stylesheets

**Read the code and copy exact values**: hex codes, spacing scale, font stack, border radius. Don't redraw from memory.

### 3. The user's shipped product
If the user has a live product but no code, use Playwright or ask for screenshots.

```bash
# Screenshot a public URL with Playwright
npx playwright screenshot https://example.com screenshot.png --viewport-size=1920,1080
```

This lets you see the real visual vocabulary.

### 4. Brand guidelines / Logo / existing assets
The user may have: logo files, brand color spec, marketing materials, slide templates. These are all context.

### 5. Competitor references
If the user says "like that XX site" — have them provide the URL or a screenshot. **Don't** work from a vague impression in your training data.

### 6. Known design systems (fallback)
If none of the above exist, use a recognized design system as a base:
- Apple HIG
- Material Design 3
- Radix Colors (palette)
- shadcn/ui (components)
- Tailwind default palette

Tell the user explicitly what you're using, so they know it's a starting point, not the final answer.

## Workflow for Acquiring Context

### Step 1: Ask the user

Required questions at task start (from `workflow.md`):

```markdown
1. Do you have an existing design system / UI kit / component library? Where?
2. Brand guidelines, color / type spec?
3. Can you share screenshots or URLs of the existing product?
4. Is there a codebase I can read?
```

### Step 2: When the user says "no", help them find it

Don't give up immediately. Try:

```markdown
Let me look for clues:
- Do your past projects have related designs?
- What colors / type does your marketing site use?
- What style is your product's logo? Got an image?
- Any product you admire as a reference?
```

### Step 3: Read every piece of context you can find

If the user provided a codebase path, you read:
1. **List the file structure first**: find style / theme / component-related files
2. **Read theme / token files**: lift specific hex / px values
3. **Read 2-3 representative components**: see the visual vocabulary (hover state, shadow, border, padding node pattern)
4. **Read the global stylesheet**: base reset, font loading
5. **If there's a Figma link / screenshots**: look at the image, but **trust the code more**

**Important**: **Do not** glance once and design from impression. Lifting 30+ specific values is what counts as actually internalizing it.

### Step 4: Vocalize the system you're going to use

After reading the context, tell the user the system you're going to use:

```markdown
Based on your codebase and product screenshots, the design system I distilled:

**Color**
- Primary: #C27558 (from tokens.css)
- Background: #FDF9F0
- Text: #1A1A1A
- Muted: #6B6B6B

**Type**
- Display: Instrument Serif (from @font-face in global.css)
- Body: Geist Sans
- Mono: JetBrains Mono

**Spacing** (from your scale system)
- 4, 8, 12, 16, 24, 32, 48, 64

**Shadow pattern**
- `0 1px 2px rgba(0,0,0,0.04)` (subtle card)
- `0 10px 40px rgba(0,0,0,0.1)` (elevated modal)

**Border-radius**
- Small elements 4px, cards 12px, buttons 8px

**Component vocabulary**
- Button: filled primary, outlined secondary, ghost tertiary, all 8px radius
- Card: white background, subtle shadow, no border

I'll start building with this. Sound right?
```

Move once the user confirms.

## Designing from a Blank Slate (fallback when there's no context)

**Strong warning**: output quality drops significantly in this case. Tell the user clearly.

```markdown
You have no design context, so I can only work from generic intuition.
The output will be "looks OK but lacks uniqueness".
Want to keep going, or supply some reference material first?
```

If the user insists, decide in this order:

### 1. Pick an aesthetic direction
Don't ship generic results. Pick a clear direction:
- brutally minimal
- editorial / magazine
- brutalist / raw
- organic / natural
- luxury / refined
- playful / toy
- retro-futuristic
- soft / pastel

Tell the user which you picked.

### 2. Pick a known design system as a skeleton
- Use Radix Colors for palette (https://www.radix-ui.com/colors)
- Use shadcn/ui for component vocabulary (https://ui.shadcn.com)
- Use Tailwind spacing scale (multiples of 4)

### 3. Pick a distinctive type pairing

Don't use Inter/Roboto. Suggested combos (free from Google Fonts):
- Instrument Serif + Geist Sans
- Cormorant Garamond + Inter Tight
- Bricolage Grotesque + Söhne (paid)
- Fraunces + Work Sans (note: Fraunces has been overused by AI)
- JetBrains Mono + Geist Sans (technical feel)

### 4. Every key decision gets reasoning

Don't decide silently. Write it in an HTML comment:

```html
<!--
Design decisions:
- Primary color: warm terracotta (oklch 0.65 0.18 25) — fits the "editorial" direction
- Display: Instrument Serif for humanist, literary feel
- Body: Geist Sans for cleanness contrast
- No gradients — committed to minimal, no AI slop
- Spacing: 8px base, golden ratio friendly (8/13/21/34)
-->
```

## Import Strategy (user gave you a codebase)

If the user says "import this codebase as reference":

### Small (<50 files)
Read all of it, internalize the context.

### Medium (50-500 files)
Focus on:
- `src/components/` or `components/`
- All styles / tokens / theme-related files
- 2-3 representative full-page components (Home.tsx, Dashboard.tsx)

### Large (>500 files)
Have the user point you at the focus:
- "I want to do the settings page" → read existing settings-related code
- "I'm doing a new feature" → read the overall shell + closest reference
- Don't aim for complete, aim for precise.

## Working with Figma / Design Mockups

If the user provides a Figma link:

- **Don't** expect to "convert Figma to HTML" directly — that needs extra tooling
- Figma links often aren't publicly accessible
- Ask the user to: export as **screenshots** + tell you the specific color / spacing values

If you only get Figma screenshots, tell the user:
- I can see the visuals but can't pull exact values
- Send me the key numbers (hex, px), or export as code (Figma supports it)

## Final Reminder

**A project's design quality ceiling is set by the quality of context you receive**.

10 minutes spent gathering context beats 1 hour doing hi-fi from thin air.

**When there's no context, prioritize asking the user — don't muscle through**.
