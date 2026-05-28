# Deep Design Critique Guide

> Detailed reference for Phase 7. Provides scoring criteria, scenario-specific emphases, common-problem checklists.

---

## Scoring Criteria in Detail

### 1. Philosophy Alignment

| Score | Criteria |
|------|------|
| 9-10 | Design perfectly embodies the spirit of the chosen philosophy; every detail has a philosophical basis |
| 7-8 | Overall direction is right, core traits land, individual details drift |
| 5-6 | Intent is visible, but execution mixes in other style elements; not pure enough |
| 3-4 | Surface mimicry only; the philosophical core isn't understood |
| 1-2 | Essentially unrelated to the chosen philosophy |

**Review points**:
- Are the chosen designer/studio's signature moves used?
- Do color, type, and layout fit that philosophical system?
- Are there "self-contradictory" elements? (e.g., choosing Kenya Hara but cramming it full of content)

### 2. Visual Hierarchy

| Score | Criteria |
|------|------|
| 9-10 | The user's eye naturally flows along the designer's intent; zero friction acquiring information |
| 7-8 | Primary/secondary relationships clear, 1-2 spots with ambiguous hierarchy |
| 5-6 | Title and body distinguish, but middle levels are muddled |
| 3-4 | Information is flat, no clear visual entry point |
| 1-2 | Chaotic, the user doesn't know where to look first |

**Review points**:
- Is the font-size contrast between title and body sufficient? (at least 2.5×)
- Do color / weight / size establish 3-4 clear hierarchy levels?
- Is white space guiding the eye?
- "Squint test": squint at it — is the hierarchy still clear?

### 3. Craft Quality

| Score | Criteria |
|------|------|
| 9-10 | Pixel-precise; alignment, spacing, color flawless |
| 7-8 | Overall polished, 1-2 minor alignment/spacing issues |
| 5-6 | Mostly aligned, but spacing isn't consistent, color use isn't systematic |
| 3-4 | Obvious alignment errors, spacing chaos, too many colors |
| 1-2 | Rough, looks like a draft |

**Review points**:
- Is a unified spacing system used (e.g., 8pt grid)?
- Is spacing consistent across like elements?
- Is the color count controlled? (usually no more than 3-4)
- Is the font family unified? (usually no more than 2)
- Are edges precisely aligned?

### 4. Functionality

| Score | Criteria |
|------|------|
| 9-10 | Every design element serves the goal; zero redundancy |
| 7-8 | Function-driven, with a small amount of removable decoration |
| 5-6 | Usable, but obvious decorative elements distract |
| 3-4 | Form over function; users have to work to find information |
| 1-2 | Drowned in decoration, has lost the ability to convey information |

**Review points**:
- If you delete any single element, does the design get worse? (If no, delete it)
- Is the CTA / key information in the most prominent position?
- Are there elements added "because it looks good"?
- Does information density match the medium? (slides shouldn't be too dense, PDFs can be denser)

### 5. Originality

| Score | Criteria |
|------|------|
| 9-10 | Refreshing — found a unique expression within the philosophical frame |
| 7-8 | Has its own ideas, not just template-applied |
| 5-6 | Middle of the road, looks like a template |
| 3-4 | Leans heavily on clichés (e.g., gradient orbs to represent AI) |
| 1-2 | Pure template or stock-asset assembly |

**Review points**:
- Did it avoid common clichés? (see "Common Problems checklist" below)
- Is there personal expression alongside fidelity to the design philosophy?
- Are there "unexpected but justified" design decisions?

---

## Scenario-Specific Critique Emphasis

Different output types weight critique differently:

| Scenario | Most important | Secondary | Can relax |
|------|-----------|--------|--------|
| WeChat public account cover/insert | Originality, visual hierarchy | Philosophy alignment | Functionality (single image, no interaction) |
| Infographic | Functionality, visual hierarchy | Craft quality | Originality (accuracy first) |
| PPT / Keynote | Visual hierarchy, functionality | Craft quality | Originality (clarity first) |
| PDF / whitepaper | Craft quality, functionality | Visual hierarchy | Originality (professionalism first) |
| Landing page / website | Functionality, visual hierarchy | Originality | — (all required) |
| App UI | Functionality, craft quality | Visual hierarchy | Philosophy alignment (usability first) |
| Xiaohongshu image | Originality, visual hierarchy | Philosophy alignment | Craft quality (vibe first) |

---

## Common Design Problems Top 10

### 1. AI tech clichés
**Problem**: gradient orbs, digital rain, blue circuit boards, robot faces
**Why it's a problem**: users are visually exhausted by these — they can't tell you apart from anyone else
**Fix**: replace direct symbols with abstract metaphors (e.g., a "dialogue" metaphor instead of a chat-bubble icon)

### 2. Insufficient type hierarchy
**Problem**: the gap between title and body is too small (<2.5×)
**Why it's a problem**: users can't quickly locate key information
**Fix**: title at least 3× the body (e.g., body 16px → title 48-64px)

### 3. Too many colors
**Problem**: 5+ colors used with no hierarchy
**Why it's a problem**: visual chaos, weak brand feel
**Fix**: limit to 1 primary + 1 secondary + 1 accent + grayscale

### 4. Inconsistent spacing
**Problem**: arbitrary spacing between elements, no system
**Why it's a problem**: looks unprofessional, visual rhythm is muddled
**Fix**: establish an 8pt grid system (only use 8/16/24/32/48/64px)

### 5. Insufficient white space
**Problem**: every spot is filled with content
**Why it's a problem**: information overcrowding causes reading fatigue, lowers transfer efficiency
**Fix**: white space at least 40% of total area (minimalist styles 60%+)

### 6. Too many fonts
**Problem**: 3+ fonts used
**Why it's a problem**: visual noise, weakens unity
**Fix**: at most 2 fonts (1 title + 1 body); create variation via weight and size

### 7. Inconsistent alignment
**Problem**: some left-aligned, some centered, some right-aligned
**Why it's a problem**: breaks visual order
**Fix**: pick one alignment (left recommended), apply globally

### 8. Decoration overpowering content
**Problem**: background patterns / gradients / shadows steal the show from the main content
**Why it's a problem**: priorities inverted — users came for information, not decoration
**Fix**: "If I delete this decoration, does the design get worse?" If no, delete it

### 9. Cyber-neon overuse
**Problem**: deep blue base (#0D1117) + neon glow effect
**Why it's a problem**: default aesthetic no-go zone (this skill's taste baseline), and one of the biggest clichés — the user can override this for their own brand
**Fix**: pick a more distinctive palette (see the color systems of the 20 styles)

### 10. Information density doesn't match medium
**Problem**: an entire page of text in a slide / 10 elements crammed into a cover image
**Why it's a problem**: different mediums have different optimal densities
**Fix**:
- Slides: 1 core point per page
- Cover image: 1 visual focus
- Infographic: layered presentation
- PDF: can be denser, but needs clear navigation

---

## Critique Output Template

```
## Design Critique Report

**Overall score**: X.X/10 [Excellent (8+) / Good (6-7.9) / Needs work (4-5.9) / Failing (<4)]

**Per-axis scores**:
- Philosophy alignment: X/10 [one-line note]
- Visual hierarchy: X/10 [one-line note]
- Craft quality: X/10 [one-line note]
- Functionality: X/10 [one-line note]
- Originality: X/10 [one-line note]

### Strengths (Keep)
- [Call out specifically what works, in design language]

### Issues (Fix)
[Sorted by severity]

**1. [Issue name]** — ⚠️ Critical / ⚡ Important / 💡 Polish
- Currently: [describe state]
- Problem: [why it's a problem]
- Fix: [specific action, with values]

### Quick Wins
If you only have 5 minutes, prioritize these 3:
- [ ] [Highest-impact fix]
- [ ] [Second priority]
- [ ] [Third priority]
```

---

**Version**: v1.0
**Updated**: 2026-02-13
