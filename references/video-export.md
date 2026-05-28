# Video Export: Exporting HTML Animations to MP4/GIF

Once an animation HTML is done, users often ask "can you export this as a video?" This guide gives you the full pipeline.

## When to Export

**Timing**:
- Animation runs end-to-end and is visually verified (Playwright screenshots confirm state at each time point)
- The user has watched it in the browser at least once and signed off
- **Do not** export while animation bugs remain — fixes get more expensive once it's video

**Likely trigger phrases from the user**:
- "Can you export this as a video?"
- "Convert to MP4"
- "Make it a GIF"
- "60fps"

## Output Specs

By default, deliver three formats and let the user pick:

| Format | Spec | Use case | Typical size (30s) |
|---|---|---|---|
| MP4 25fps | 1920×1080 · H.264 · CRF 18 | WeChat articles, video accounts, YouTube | 1-2 MB |
| MP4 60fps | 1920×1080 · minterpolate frame interpolation · H.264 · CRF 18 | High-frame-rate showcases, Bilibili, portfolios | 1.5-3 MB |
| GIF | 960×540 · 15fps · palette optimized | Twitter/X, README, Slack previews | 2-4 MB |

## Toolchain

Two scripts under `scripts/`:

### 1. `render-video.js` — HTML → MP4

Records a 25fps baseline MP4. Depends on globally installed playwright.

```bash
NODE_PATH=$(npm root -g) node /path/to/claude-design/scripts/render-video.js <html file>
```

Optional flags:
- `--duration=30` animation length (seconds)
- `--width=1920 --height=1080` resolution
- `--trim=2.2` seconds to trim from the start of the video (strips reload + font loading)
- `--fontwait=1.5` font load wait (seconds); raise this when there are many fonts

Output: same directory as the HTML, same name with `.mp4`.

### 2. `add-music.sh` — MP4 + BGM → MP4

Mixes BGM into a silent MP4. Pick from the bundled BGM library by scene (mood) or supply your own audio. Auto-matches duration and adds fades.

```bash
bash add-music.sh <input.mp4> [--mood=<name>] [--music=<path>] [--out=<path>]
```

**Bundled BGM library** (at `assets/bgm-<mood>.mp3`):

| `--mood=` | Style | Scene |
|-----------|------|---------|
| `tech` (default) | Apple Silicon / Apple keynote, minimal synth + piano | Product launches, AI tools, skill promos |
| `ad` | Upbeat modern electronic, with build + drop | Social media ads, product teasers, promos |
| `educational` | Warm, bright, soft guitar/electric piano, inviting | Explainers, tutorial intros, course teasers |
| `educational-alt` | Sibling alternative, swap when you want variety | Same as above |
| `tutorial` | Lo-fi ambient, almost imperceptible | Software demos, programming tutorials, long demos |
| `tutorial-alt` | Sibling alternative | Same as above |

**Behavior**:
- BGM is trimmed to video duration
- 0.3s fade-in + 1s fade-out (no hard cuts)
- Video stream `-c:v copy` (no re-encode); audio AAC 192k
- `--music=<path>` takes precedence over `--mood`; pass any external audio
- A wrong mood name lists all valid options — no silent failure

**Typical pipeline** (animation export triplet + BGM):
```bash
node render-video.js animation.html                        # record
bash convert-formats.sh animation.mp4                      # derive 60fps + GIF
bash add-music.sh animation-60fps.mp4                      # add default tech BGM
# Or per scene:
bash add-music.sh tutorial-demo.mp4 --mood=tutorial
bash add-music.sh product-promo.mp4 --mood=ad --out=promo-final.mp4
```

### 3. `convert-formats.sh` — MP4 → 60fps MP4 + GIF

Derive a 60fps version and a GIF from an existing MP4.

```bash
bash /path/to/claude-design/scripts/convert-formats.sh <input.mp4> [gif_width] [--minterpolate]
```

Outputs (same directory as input):
- `<name>-60fps.mp4` — defaults to `fps=60` frame duplication (broad compatibility); pass `--minterpolate` for high-quality motion interpolation
- `<name>.gif` — palette-optimized GIF (default 960 wide, adjustable)

**Choosing a 60fps mode**:

| Mode | Command | Compatibility | Use case |
|---|---|---|---|
| Frame duplication (default) | `convert-formats.sh in.mp4` | QuickTime/Safari/Chrome/VLC all play | General delivery, platform uploads, social media |
| minterpolate interpolation | `convert-formats.sh in.mp4 --minterpolate` | macOS QuickTime/Safari may refuse to open | Bilibili and similar showcases that need true interpolation. **Before delivery, test the target player locally.** |

Why default to frame duplication? minterpolate's H.264 elementary stream has a known compat bug — we've hit "macOS QuickTime won't open it" repeatedly when minterpolate was the default. See `animation-pitfalls.md` §14.

`gif_width` parameter:
- 960 (default) — general-purpose social platforms
- 1280 — sharper but larger file
- 600 — Twitter/X priority loading

## Full Pipeline (Standard Recommendation)

After the user says "export as video":

```bash
cd <project directory>

# Assume $SKILL points to the root of this skill (substitute your install path)

# 1. Record the 25fps baseline MP4
NODE_PATH=$(npm root -g) node "$SKILL/scripts/render-video.js" my-animation.html

# 2. Derive the 60fps MP4 and the GIF
bash "$SKILL/scripts/convert-formats.sh" my-animation.mp4

# Deliverables:
# my-animation.mp4         (25fps · 1-2 MB)
# my-animation-60fps.mp4   (60fps · 1.5-3 MB)
# my-animation.gif         (15fps · 2-4 MB)
```

## Technical Details (For Debugging)

### Playwright recordVideo Gotchas

- Frame rate is fixed at 25fps; you can't record 60fps directly (Chromium headless compositor ceiling)
- Recording starts the moment the context is created — you must use `trim` to strip the leading load time
- Default format is webm; you need ffmpeg to convert to H.264 MP4 for general playback

`render-video.js` already handles all of this.

### ffmpeg minterpolate Parameters

Current config: `minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1`

- `mi_mode=mci` — motion compensation interpolation
- `mc_mode=aobmc` — adaptive overlapped block motion compensation
- `me_mode=bidir` — bidirectional motion estimation
- `vsbmc=1` — variable size block motion compensation

Works well on CSS **transform animations** (translate/scale/rotate).
On **pure fades** it can produce slight ghosting — if the user dislikes it, fall back to plain frame duplication:

```bash
ffmpeg -i input.mp4 -r 60 -c:v libx264 ... output.mp4
```

### Why GIF Palette Needs Two Passes

GIF is limited to 256 colors. A single-pass GIF compresses the whole animation's color into one generic 256-color palette, which smears subtle palettes like beige + orange.

Two passes:
1. `palettegen=stats_mode=diff` — scans the whole clip, generates the **optimal palette for this specific animation**
2. `paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle` — encodes with that palette; rectangle diff only updates changed regions, shrinking the file substantially

For fade transitions, `dither=bayer` is smoother than `none` but produces a slightly larger file.

## Pre-flight Check (Before Export)

30-second self-check before export:

- [ ] HTML runs end-to-end in the browser with no console errors
- [ ] Frame 0 of the animation is the full initial state (not a blank loading state)
- [ ] The last frame is a stable closing state (not cut off)
- [ ] Fonts/images/emoji all render correctly (see `animation-pitfalls.md`)
- [ ] The duration flag matches the actual animation length in the HTML
- [ ] Stage in the HTML detects `window.__recording` and forces loop=false (must verify on hand-written Stages; bundled with `assets/animations.jsx`)
- [ ] The closing Sprite has `fadeOut={0}` (no fade-out on the last frame of the video)
- [ ] "Created by Huashu-Design" watermark is present (mandatory for animation scenes only; for third-party brand work, prefix with "Unofficial · ". See SKILL.md §"Skill promo watermark")

## Standard Delivery Notes

Standard delivery message format after export:

```
**Full delivery**

| File | Format | Spec | Size |
|---|---|---|---|
| foo.mp4 | MP4 | 1920×1080 · 25fps · H.264 | X MB |
| foo-60fps.mp4 | MP4 | 1920×1080 · 60fps (motion interpolation) · H.264 | X MB |
| foo.gif | GIF | 960×540 · 15fps · palette optimized | X MB |

**Notes**
- 60fps uses minterpolate motion-estimated interpolation; great on transform animations
- GIF uses palette optimization; a 30s animation compresses to about 3MB

Let me know if you need a different size or frame rate.
```

## Common Follow-up Requests

| User says | Response |
|---|---|
| "Too big" | MP4: raise CRF to 23-28; GIF: drop resolution to 600 or fps to 10 |
| "GIF looks blurry" | Raise `gif_width` to 1280; or suggest MP4 instead (WeChat Moments supports it too) |
| "Need 9:16 portrait" | Change HTML source `--width=1080 --height=1920`, re-record |
| "Add a watermark" | ffmpeg `-vf "drawtext=..."` or `overlay=` a PNG |
| "Need transparent background" | MP4 doesn't support alpha; use WebM VP9 + alpha or APNG |
| "Need lossless" | CRF 0 + preset veryslow (file gets 10× bigger) |
