# Landing Page Track

> First-class deliverable: client-ready marketing landing pages.
> Used when `mode === "prototype"` in the webui or the user asks for "a landing page", "marketing site", "homepage", "client mockup", etc.
>
> This is **not** the App-prototype track (no iPhone bezel, no multi-screen state machine). Output is a single long-scroll HTML page that could plausibly be hosted as `business.com`.

---

## 1 · What you're producing

A self-contained, single-file HTML document the user can show a real prospect and say "this is what your site could look like." Therefore:

- **Content must look real.** Use specific business names, service descriptions, prices, locations, hours. Never `Lorem ipsum`. Never `[Your Business Here]`. If the user didn't supply specifics, infer plausible ones from the brief (and say which you invented in the delivery message).
- **Sections must look like a real designer chose them.** Don't dump every section template you know — pick the 4–7 that fit the business type. A barbershop doesn't need a pricing table comparison; a SaaS doesn't need an "opening hours" block.
- **Polish > completeness.** Better to ship 5 great sections than 9 mediocre ones.

---

## 2 · Section library

Pick from these. Don't invent generic ones ("Our Mission", "Why Choose Us") — use the specific intent below.

### Hero (always)
- **Anchor**: 1 headline (≤10 words, benefit not feature), 1 sub (≤25 words), 1 primary CTA, 1 hero visual (real photo, real product UI, or real brand mark — never a CSS gradient blob)
- **Variants**: split (copy left, image right) · centered (single column, large image below) · full-bleed (image is the background)
- **Anti-pattern**: vague aspirational copy ("Empowering tomorrow's vision"), three-button CTA stack, decorative hero shapes

### Social proof (recommended, place near hero)
- Logos of customers/clients, OR named testimonials with photo + role + company, OR a single oversized stat ("3,200 weddings shot since 2014")
- One row, restrained. Six logos > thirty.

### Features / What we do
- **For services** (restaurants, agencies, trades): use a 3–4 item grid with photo + short description per service, not icon + bullet
- **For SaaS / digital products**: use feature blocks alternating image-left / image-right, real UI screenshot per feature
- **Anti-pattern**: identical-shape cards with three Lucide icons in primary colour

### Gallery / Portfolio (services with visual output)
- Restaurants: dish photos. Salons: hair shots. Agencies: case study thumbnails. Photographers: portfolio grid.
- Use real-aspect-ratio image grids (CSS Grid with `aspect-ratio: 4/3`), not equal squares

### Pricing (SaaS / subscription / packaged services only)
- 2–3 tiers max, middle highlighted. Never 4+ tiers in a marketing page.
- Each tier: name, price + period, 1-line positioning, 4–6 included items (concrete: "Up to 5 users" not "Team collaboration"), CTA
- **Skip entirely** for restaurants, single-service businesses, custom-quote work

### Testimonials (full block, distinct from social proof bar)
- 1 oversized quote OR 3 medium ones. Always include name, role, company, photo. Vague "John D., CEO" feels fake.

### FAQ (when objections are predictable)
- 4–6 questions max. Real user questions, not marketing-disguised features.
- Use `<details>` for native expand/collapse — don't reinvent with JS.

### Booking / Contact / CTA closer (always — last section before footer)
- Restaurants/local: opening hours, address with map, phone, booking widget placeholder
- Services: contact form (name, email, message — three fields max) or "Book a call" CTA
- SaaS: trial CTA + "Talk to sales" secondary
- Always include the primary CTA from the hero, repeated.

### Footer
- 3–4 columns max. Logo + tagline, nav, contact, legal. Don't pad with empty link columns.

---

## 3 · Section selection by business type

| Business type | Required sections (in order) |
|---|---|
| Restaurant / café / bar | Hero · Menu highlights · Gallery · Reviews · Hours/location · Booking CTA · Footer |
| Local trade (plumber, electrician, barber) | Hero · Services grid · Service area map · Reviews · Booking/phone CTA · Footer |
| Agency / studio | Hero · Selected work grid · Services list · Process · Testimonials · Contact · Footer |
| SaaS / digital product | Hero · Logo bar · Features (alternating) · How it works · Pricing · FAQ · CTA · Footer |
| Personal brand (coach, consultant) | Hero · About / story · Services or offerings · Testimonials · Lead magnet or CTA · Footer |
| E-commerce single-product | Hero · Product showcase · Features · Reviews · Buy CTA · FAQ · Footer |
| Event / launch | Hero (with date) · What/why · Speakers or agenda · Logos · Register CTA · Footer |

If the business doesn't fit, pick the closest row and adjust. Never just stack every section.

---

## 4 · Anti-slop checklist (apply before delivery)

- [ ] No purple-to-pink gradients. No `linear-gradient(135deg, ...)` as a hero background unless brand-justified.
- [ ] No emoji-as-icon (🚀 in a feature card). Use real SVG marks or none.
- [ ] No "Trusted by 10,000+ teams worldwide" without specifying who.
- [ ] No three-card grid where each card is `<icon><h3><p>` and nothing distinguishes them.
- [ ] No `<button>Get Started</button>` as the only CTA copy. Be specific: "Book a table", "Start a 14-day trial", "Get a free quote".
- [ ] Every image is real (Unsplash/Wikimedia/brand-supplied) or a real product UI screenshot. No CSS-drawn product silhouettes.
- [ ] If a brand was named, the brand's logo is on the page (top-left of header, in the footer, ideally both).
- [ ] Mobile breakpoint actually works. Test with the iframe at 375px width before delivery.

---

## 5 · Asset rules (delegates to core asset protocol in SKILL.md)

If the user named a real business: **fetch their logo and at least one real photo of the business/product before generating.** Search the web. If you can't find them, ask — don't fall back to a CSS rectangle labeled "[Logo]".

If the business is fictional or the user explicitly said "no brand assets, just make it look good": pull stock photos from Unsplash that match the business type (`https://source.unsplash.com/...` or specific Unsplash photo URLs you've verified). Use one consistent visual treatment across all photos (e.g., all warm-toned, all desaturated) — mismatched photo styles is a top slop tell.

---

## 6 · Output format

Single HTML document. Inline `<style>`. No build step, no external CSS files. JavaScript only if a section genuinely needs it (FAQ accordion can use `<details>`, booking forms can be no-JS).

Header: include `<meta name="viewport" content="width=device-width, initial-scale=1">`. Use system font stack or one Google Font max — don't load three Google Fonts.

The page must render correctly when loaded in an `<iframe sandbox="allow-scripts">` (this is how the webui previews it).
