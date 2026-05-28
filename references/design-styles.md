# Design-Philosophy Style Library: 20 Systems

> A design-style library for visual design (web / PPT / PDF / infographic / illustration / app, etc.).
> Each style provides: philosophical core + key traits + Prompt DNA (combine with scene templates).

## Style × Scene × Execution Path quick-reference

| Style | Web | PPT | PDF | Infographic | Cover | AI gen | Best path |
|------|:---:|:---:|:---:|:-----:|:---:|:-----:|---------|
| 01 Pentagram | ★★★ | ★★★ | ★★☆ | ★★☆ | ★★★ | ★☆☆ | HTML |
| 02 Stamen Design | ★★☆ | ★★☆ | ★★☆ | ★★★ | ★★☆ | ★★☆ | Hybrid |
| 03 Information Architects | ★★★ | ★☆☆ | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ | HTML |
| 04 Fathom | ★★☆ | ★★★ | ★★★ | ★★★ | ★★☆ | ★☆☆ | HTML |
| 05 Locomotive | ★★★ | ★★☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★☆ | Hybrid |
| 06 Active Theory | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★★ | AI gen |
| 07 Field.io | ★★☆ | ★★☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI gen |
| 08 Resn | ★★★ | ★☆☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★☆ | AI gen |
| 09 Experimental Jetset | ★★☆ | ★★☆ | ★★☆ | ★★☆ | ★★★ | ★★☆ | Hybrid |
| 10 Müller-Brockmann | ★★☆ | ★★★ | ★★★ | ★★★ | ★★☆ | ★☆☆ | HTML |
| 11 Build | ★★★ | ★★★ | ★★☆ | ★☆☆ | ★★★ | ★☆☆ | HTML |
| 12 Sagmeister & Walsh | ★★☆ | ★★★ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI gen |
| 13 Zach Lieberman | ★☆☆ | ★☆☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI gen |
| 14 Raven Kwok | ★☆☆ | ★★☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI gen |
| 15 Ash Thorp | ★★☆ | ★★☆ | ★☆☆ | ★☆☆ | ★★★ | ★★★ | AI gen |
| 16 Territory Studio | ★★☆ | ★★☆ | ★☆☆ | ★★☆ | ★★★ | ★★★ | AI gen |
| 17 Takram | ★★★ | ★★★ | ★★★ | ★★☆ | ★★☆ | ★☆☆ | HTML |
| 18 Kenya Hara | ★★☆ | ★★★ | ★★★ | ★☆☆ | ★★★ | ★☆☆ | HTML |
| 19 Irma Boom | ★☆☆ | ★★☆ | ★★★ | ★★☆ | ★★★ | ★★☆ | Hybrid |
| 20 Neo Shen | ★★☆ | ★★☆ | ★★☆ | ★★☆ | ★★★ | ★★★ | AI gen |

> Scene fit: ★★★ = strongly recommended / ★★☆ = suitable / ★☆☆ = needs adaptation
> AI gen: ★★★ = great direct output / ★★☆ = needs tuning / ★☆☆ = HTML execution recommended
> Best path: AI gen (image direct) / HTML (code-rendered, data-precise) / Hybrid (HTML layout + AI imagery)

**Core rule**: styles with explicit visual elements (illustration / particles / generative art) produce great direct AI output; styles dependent on precise typography and data (grid / information architecture / whitespace) are more controllable via HTML rendering.

---

## I. Information Architecture school (01–04)
> Philosophy: "Data isn't decoration — it's the building material."

### 01. Pentagram — Michael Bierut style
**Philosophy**: type is language, the grid is thought
**Key traits**:
- Extremely restrained color (black + white + one brand color)
- Modern interpretation of the Swiss grid
- Typography as the primary visual language
- Strategic use of negative space (60%+ whitespace)

**Prompt DNA**:
```
Pentagram/Michael Bierut style:
- Extreme typographic hierarchy, Helvetica/Univers family
- Swiss grid with precise mathematical spacing
- Black/white + one accent color (#HEX)
- Information architecture as visual structure
- 60%+ whitespace ratio
- Data visualization as primary decoration
```

**Representative work**: Hillary Clinton 2016 campaign identity
**Search keywords**: pentagram hillary logo system

---

### 02. Stamen Design — data poetics
**Philosophy**: turn data into a landscape you can touch
**Key traits**:
- Cartographic thinking applied to information design
- Algorithmically generated organic shapes
- Warm data-viz palette (terracotta, sage green, deep blue)
- Interactive layered system

**Prompt DNA**:
```
Stamen Design aesthetic:
- Cartographic approach to data visualization
- Organic, algorithm-generated patterns
- Warm palette (terracotta, sage green, deep blues)
- Layered information like topographic maps
- Hand-crafted feel despite digital precision
- Soft shadows and depth
```

**Representative work**: COVID-19 surge map
**Search keywords**: stamen covid map visualization

---

### 03. Information Architects — content-first principle
**Philosophy**: design isn't decoration — it's architecture for content
**Key traits**:
- Extreme content-hierarchy clarity
- System fonts only (optimized for reading)
- Loyal to the classic blue-hyperlink tradition
- Performance as aesthetic

**Prompt DNA**:
```
Information Architects philosophy:
- Content-first hierarchy, zero decorative elements
- System fonts only (SF Pro/Roboto/Inter)
- Classic blue hyperlinks (#0000EE)
- Reading-optimized line length (66 characters)
- Progressive disclosure of depth
- Text-heavy, fast-loading design
```

**Representative work**: iA Writer app
**Search keywords**: information architects ia writer

---

### 04. Fathom Information Design — scientific storytelling
**Philosophy**: every pixel must carry information
**Key traits**:
- Scientific-journal rigor + design elegance
- Precise visualization of quantitative data
- Calm, professional palette (gray, navy)
- Footnote-and-citation system designed into the layout

**Prompt DNA**:
```
Fathom Information Design style:
- Scientific journal aesthetic meets modern design
- Precise data visualization (charts, timelines, scatter plots)
- Neutral scheme (grays, navy, one highlight color)
- Footnote/citation design integrated into layout
- Clean sans-serif (GT America/Graphik)
- Information density without clutter
```

**Representative work**: Bill & Melinda Gates Foundation annual report
**Search keywords**: fathom information design gates foundation

---

## II. Motion poetics school (05–08)
> Philosophy: "Technology itself is a kind of flowing poetry."

### 05. Locomotive — master of scroll storytelling
**Philosophy**: scrolling isn't browsing — it's a journey
**Key traits**:
- Silky parallax scrolling
- Cinematic, shot-by-shot storytelling
- Bold spatial whitespace
- Precise choreography of moving elements

**Prompt DNA**:
```
Locomotive scroll narrative style:
- Film-like scene composition with parallax depth
- Generous vertical spacing between sections
- Bold typography emerging from darkness
- Smooth motion blur effects
- Dark mode (near-black backgrounds)
- Strategic glowing accents
- Hero sections 100vh tall
```

**Representative work**: Lusion.co website
**Search keywords**: locomotive scroll lusion

---

### 06. Active Theory — WebGL poets
**Philosophy**: making technology visible is making it comprehensible
**Key traits**:
- 3D particle systems as a core element
- Real-time rendered data visualization
- World-building driven by mouse interaction
- Neon-and-deep-space palette

**Prompt DNA**:
```
Active Theory WebGL aesthetic:
- Particle systems representing data flow
- 3D visualization in depth space
- Neon gradients (cyan/magenta/electric blue) on dark
- Mouse-reactive environment
- Depth of field and bokeh effects
- Floating UI with glassmorphism
```

**Representative work**: NASA Prospect
**Search keywords**: active theory nasa webgl

---

### 07. Field.io — algorithmic aesthetics
**Philosophy**: code is the designer
**Key traits**:
- Generative-art systems
- Dynamic graphics that change with every visit
- Intelligent choreography of abstract geometry
- Balance of technical feel and artistry

**Prompt DNA**:
```
Field.io generative design style:
- Abstract geometric patterns, algorithmically generated
- Dynamic composition that feels computational
- Monochromatic base with vibrant accent
- Mathematical precision in spacing
- Voronoi diagrams or Delaunay triangulation
- Clean code aesthetic
```

**Representative work**: British Council digital installations
**Search keywords**: field.io generative design

---

### 08. Resn — narrative-driven interaction
**Philosophy**: every click advances the story
**Key traits**:
- Gamified user journeys
- Strongly emotionalized design
- Deep blend of illustration and code
- Non-linear exploration experience

**Prompt DNA**:
```
Resn interactive storytelling approach:
- Illustrative style mixed with UI elements
- Gamified exploration (progress indicators)
- Warm color palette despite tech subject
- Character-driven design
- Scroll-triggered animations
- Editorial illustration meets product design
```

**Representative work**: Resn.co.nz portfolio
**Search keywords**: resn interactive storytelling

---

## III. Minimalism school (09–12)
> Philosophy: "Reduce until nothing more can be reduced."

### 09. Experimental Jetset — conceptual minimalism
**Philosophy**: one idea = one form
**Key traits**:
- A single visual metaphor running through the whole design
- Mondrian palette of blue/red/yellow + black/white
- Type as graphic
- Honest, anti-commercial design

**Prompt DNA**:
```
Experimental Jetset conceptual minimalism:
- Single visual metaphor for entire design
- Primary colors only (red/blue/yellow) + black/white
- Typography as main graphic element
- Grid-based with deliberate rule-breaking
- No photography, only type and geometry
- Anti-commercial, honest aesthetic
```

**Representative work**: Whitney Museum identity
**Search keywords**: experimental jetset whitney responsive w

---

### 10. Müller-Brockmann lineage — Swiss-grid purism
**Philosophy**: objectivity is beauty
**Key traits**:
- Mathematically precise grid system (8pt baseline)
- Absolute left- or center-alignment
- One- or two-color scheme
- Functionalism above all

**Prompt DNA**:
```
Josef Müller-Brockmann Swiss modernism:
- Mathematical grid system (8pt baseline)
- Strict alignment (flush left or centered)
- Two-color maximum (black + one accent)
- Akzidenz-Grotesk or similar rationalist typeface
- No decorative elements
- Timeless, objective aesthetic
```

**Representative work**: *Grid Systems in Graphic Design*
**Search keywords**: muller brockmann grid systems poster

---

### 11. Build — contemporary minimal branding
**Philosophy**: refined simplicity is harder than complexity
**Key traits**:
- Luxury-grade whitespace (70%+)
- Subtle font-weight contrast (200–600)
- Strategic use of a single accent color
- Breathing-room rhythm

**Prompt DNA**:
```
Build studio luxury minimalism:
- Generous whitespace (70%+ of area)
- Subtle typography weight shifts (200 to 600)
- Single accent color used sparingly
- High-end product photography aesthetic
- Soft shadows and subtle gradients
- Golden ratio proportions
```

**Representative work**: Build studio portfolio
**Search keywords**: build studio london branding

---

### 12. Sagmeister & Walsh — joyful minimalism
**Philosophy**: beauty is the emotional dimension of function
**Key traits**:
- Unexpected bursts of color
- Fusion of handmade and digital
- Positive visual language
- Experimental but legible

**Prompt DNA**:
```
Sagmeister & Walsh joyful philosophy:
- Unexpected color bursts on minimal base
- Handmade elements (physical objects in digital)
- Optimistic visual language
- Experimental typography that remains legible
- Human warmth through imperfection
- Mix of analog and digital aesthetics
```

**Representative work**: The Happy Show
**Search keywords**: sagmeister walsh happy show

---

## IV. Experimental avant-garde school (13–16)
> Philosophy: "Breaking the rules is making the rules."

### 13. Zach Lieberman — code poetics
**Philosophy**: programming is painting
**Key traits**:
- Hand-drawn-feeling algorithmic graphics
- Real-time generative art
- Pure expression in black and white
- Visibility of the tool itself

**Prompt DNA**:
```
Zach Lieberman code-as-art style:
- Hand-drawn aesthetic generated by code
- Black and white only, no color
- Real-time generative patterns
- Sketch-like line quality
- Visible process/grid/construction lines
- Poetic interpretation of algorithms
```

**Representative work**: openFrameworks creative coding
**Search keywords**: zach lieberman openframeworks generative

---

### 14. Raven Kwok — parametric aesthetics
**Philosophy**: the beauty of the system beats the beauty of the individual
**Key traits**:
- Fractal and recursive graphics
- High-contrast black and white
- Architectural information structures
- An algorithmic interpretation of the Eastern garden

**Prompt DNA**:
```
Raven Kwok parametric aesthetic:
- Fractal patterns and recursive structures
- High-contrast black and white
- Architectural visualization of data
- Chinese garden principles in algorithm form
- Intricate detail that rewards zooming
- Processing/Creative coding aesthetic
```

**Representative work**: Raven Kwok generative-art exhibitions
**Search keywords**: raven kwok processing generative art

---

### 15. Ash Thorp — cyber poetics
**Philosophy**: the future isn't cold — it's a lonely poem
**Key traits**:
- Cinema-grade light and shadow
- A warm version of cyberpunk (orange/teal, not cold blue)
- Narrative-driven concept design
- Refinement of industrial aesthetics

**Prompt DNA**:
```
Ash Thorp cinematic concept art:
- Film-grade lighting and atmospheric effects
- Warm cyberpunk (orange/teal, NOT cold blue)
- Industrial design meets luxury
- Narrative concept art feel
- Volumetric lighting and god rays
- Blade Runner warmth over Tron coldness
```

**Representative work**: Ghost in the Shell concept art
**Search keywords**: ash thorp ghost shell concept art

---

### 16. Territory Studio — screen-interface fiction
**Philosophy**: today's imagination of tomorrow's UI
**Key traits**:
- Screen design for sci-fi cinema (FUI)
- Holographic-projection feel
- Multi-layered overlapping data viz
- A believable future

**Prompt DNA**:
```
Territory Studio FUI (Fantasy User Interface):
- Fantasy User Interface design
- Holographic projection aesthetics
- Orange/amber monochrome or cyan accents
- Multiple overlapping data layers
- Believable future technology
- Technical readouts and data streams
```

**Representative work**: Blade Runner 2049 screen graphics
**Search keywords**: territory studio blade runner interface

---

## V. Eastern-philosophy school (17–20)
> Philosophy: "Whitespace is content."

### 17. Takram — Japanese speculative design
**Philosophy**: technology is a medium for thought
**Key traits**:
- Elegance in concept prototypes
- Soft tech feel (rounded corners, gentle shadows)
- Charts as art pieces
- Modest sophistication

**Prompt DNA**:
```
Takram Japanese speculative design:
- Elegant concept prototypes and diagrams
- Soft tech aesthetic (rounded corners, gentle shadows)
- Charts and diagrams as art pieces
- Modest sophistication
- Neutral natural colors (beige, soft gray, muted green)
- Design as philosophical inquiry
```

**Representative work**: NHK Fabricated City
**Search keywords**: takram nhk data visualization

---

### 18. Kenya Hara — the design of emptiness
**Philosophy**: design isn't filling — it's emptying
**Key traits**:
- Extreme whitespace (80%+)
- Digital expression of paper texture
- Layers of white (warm white, cool white, off-white)
- Visualization of the tactile

**Prompt DNA**:
```
Kenya Hara "emptiness" design:
- Extreme whitespace (80%+)
- Paper texture and tactility in digital form
- Layers of white (warm white, cool white, off-white)
- Minimal color (if any, very desaturated)
- Design by subtraction not addition
- Zen simplicity
```

**Representative work**: Muji art direction, *Designing Design*
**Search keywords**: kenya hara designing design muji

---

### 19. Irma Boom — book architect
**Philosophy**: the physical poetics of information
**Key traits**:
- Non-linear information architecture
- Play with edges and margins
- Unexpected color combinations (pink+red, orange+brown)
- Craft translated to digital

**Prompt DNA**:
```
Irma Boom book architecture style:
- Non-linear information structure
- Play with edges, margins, boundaries
- Unexpected color combos (pink+red, orange+brown)
- Handcraft translated to digital
- Dense information inviting exploration
- Editorial design, unconventional grid
```

**Representative work**: SHV Think Book (2,136 pages)
**Search keywords**: irma boom shv think book

---

### 20. Neo Shen — Eastern light-and-shadow poetry
**Philosophy**: technology needs human warmth
**Key traits**:
- Digital ink-wash bleed
- Soft light-halo effects
- Poetic whitespace
- Emotional palette (deep blue, warm gray, soft gold)

**Prompt DNA**:
```
Neo Shen poetic Chinese aesthetic:
- Digital interpretation of ink wash painting
- Soft glow and light diffusion effects
- Poetic negative space
- Emotional palette (deep blues, warm grays, soft gold)
- Calligraphic influences in typography
- Atmospheric depth
```

**Representative work**: Neo Shen digital-art series
**Search keywords**: neo shen digital ink wash art

---

## Prompt usage notes

**Combination formula**: `[Style Prompt DNA] + [Scene Template (see scene-templates.md)] + [Specific content]`

### Core principle: describe mood, not layout

The key to AI image generation: short prompts beat long prompts. Three sentences of mood and content outperform 30 lines of layout detail.

| Diversity-killing approach | Creativity-igniting approach |
|----------------|----------------|
| Specify color ratios (60%/25%/15%) | Describe mood ("warm like Sunday morning") |
| Specify layout positions ("title centered top, image on right") | Reference a specific aesthetic ("Pentagram editorial feel") |
| Constrain character pose and expression | Let the AI interpret the style naturally |
| List every visual element to include | Describe what the audience should feel |

### Good / Bad examples

**Bad — over-constrained (AI generates flat and empty):**
```
Professional presentation slide. Dark background, light text.
Title centered at top. Two columns below. Left column: bullet points.
Right column: bar chart. Colors: navy 60%, white 30%, gold 10%.
Font size: title 36pt, body 18pt. Margins: 40px all sides.
```

**Good — mood-driven (diverse and textured output):**
```
A data visualization that feels like a Bloomberg Businessweek
editorial spread. The key number "28.5%" should dominate the
composition like a headline. Warm cream tones with sharp black
typography. The data tells a story of dramatic channel shift.
```

### Choosing the execution path

Pick by the "Best path" column in the quick-reference table:
- **AI gen**: styles with explicit visual elements (06/07/12/13/14/15/16/20) — generate directly via Gemini / Midjourney
- **HTML render**: styles dependent on precise typography (01/03/04/10/11/17/18) — code controls data and layout
- **Hybrid**: HTML for skeleton layout + AI-generated imagery / backgrounds (02/05/08/09/19)

### Quality control

1. Bad: write "in the style of Pentagram" directly → Good: describe concrete design traits
2. Text often comes out wrong in AI generation → replace text after generation
3. Proportions distort easily → specify aspect ratio explicitly
4. Generate 3–5 variants first, pick the best, then refine

**Default aesthetic no-go zones** (users may override per their brand):
- Bad: cyber-neon / deep-blue background (#0D1117)
- Bad: personal signature / watermark on cover images

---

**Version**: v2.1
**Updated**: 2026-02-13
**Applicable**: web / PPT / PDF / infographic / cover / illustration / app — all visual design
**Integration with image-to-slides**: PPT scenes can reference styles in this file directly, then run via the image-to-slides skill to generate
