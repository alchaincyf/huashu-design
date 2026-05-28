# Animation Pitfalls: Bugs and Rules from Real HTML Animation Mistakes

The most common bugs encountered while building animations, and how to avoid them. Every rule comes from a real failure case.

Read this before writing animation code — it saves you an iteration.

## 1. Stacked layout — `position: relative` is the default obligation

**The bug**: a sentence-wrap element contained 3 bracket-layer children (`position: absolute`). Without setting `position: relative` on sentence-wrap, the absolute brackets used `.canvas` as their coordinate system and drifted 200px off the bottom of the screen.

**Rule**:
- Any container holding `position: absolute` children **must** explicitly set `position: relative`
- Even if you don't visually need an "offset," write `position: relative` as the coordinate-system anchor
- If you're writing `.parent { ... }` and its children include `.child { position: absolute }`, reflexively add `relative` to the parent

**Quick check**: every time you see `position: absolute`, count ancestors upward and confirm the nearest positioned ancestor is the coordinate system you *want*.

## 2. Character traps — don't rely on rare Unicode

**The bug**: trying to use `␣` (U+2423 OPEN BOX) to visualize a "space token." Neither Noto Serif SC nor Cormorant Garamond has this glyph; it renders as blank/tofu and the audience can't see anything.

**Rule**:
- **Every character that appears in your animation must exist in your chosen font**
- Common rare-character blacklist: `␣ ␀ ␐ ␋ ␨ ↩ ⏎ ⌘ ⌥ ⌃ ⇧ ␦ ␖ ␛`
- To represent meta-characters like "space / return / tab," use a **CSS-built semantic box**:
  ```html
  <span class="space-key">Space</span>
  ```
  ```css
  .space-key {
    display: inline-flex;
    padding: 4px 14px;
    border: 1.5px solid var(--accent);
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.3em;
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }
  ```
- Verify emoji too: some emoji fall back to a gray square outside Noto Emoji — prefer an `emoji` font-family or an SVG

## 3. Data-driven Grid/Flex templates

**The bug**: the JS has `const N = 6` tokens, but the CSS hard-codes `grid-template-columns: 80px repeat(5, 1fr)`. The 6th token gets no column and the whole matrix misaligns.

**Rule**:
- When the count comes from a JS array (`TOKENS.length`), the CSS template should be data-driven too
- Option A: inject a CSS variable from JS
  ```js
  el.style.setProperty('--cols', N);
  ```
  ```css
  .grid { grid-template-columns: 80px repeat(var(--cols), 1fr); }
  ```
- Option B: use `grid-auto-flow: column` so the browser auto-expands
- **Forbid the "fixed number + JS constant" combo** — change N and the CSS won't keep up

## 4. Transition gaps — scene switches must be continuous

**The bug**: between zoom1 (13–19s) → zoom2 (19.2–23s), the main sentence is already hidden, zoom1 fades out (0.6s) + zoom2 fades in (0.6s) + stagger delay (0.2s+) = roughly 1 second of pure blank screen. The audience thinks the animation froze.

**Rule**:
- For continuous scene switches, fade out and fade in should **cross-overlap**, not have one fully disappear before the next starts
  ```js
  // bad:
  if (t >= 19) hideZoom('zoom1');      // 19.0s out
  if (t >= 19.4) showZoom('zoom2');    // 19.4s in → 0.4s blank gap

  // good:
  if (t >= 18.6) hideZoom('zoom1');    // begin fade out 0.4s earlier
  if (t >= 18.6) showZoom('zoom2');    // fade in simultaneously (cross-fade)
  ```
- Or use an "anchor element" (e.g. the main sentence) as a visual link between scenes — briefly bringing it back during the zoom switch
- Match CSS transition durations carefully; avoid triggering the next one before the previous finishes

## 5. Pure Render principle — animation state must be seekable

**The bug**: using `setTimeout` + `fireOnce(key, fn)` to chain-trigger animation state. Normal playback is fine, but for frame-by-frame recording or seeking to an arbitrary time, the setTimeouts that already fired can't "go back in time."

**Rule**:
- The `render(t)` function should ideally be a **pure function**: given t, output a unique DOM state
- If side effects are unavoidable (e.g. class toggles), use a `fired` set with an explicit reset:
  ```js
  const fired = new Set();
  function fireOnce(key, fn) { if (!fired.has(key)) { fired.add(key); fn(); } }
  function reset() { fired.clear(); /* clear all .show classes */ }
  ```
- Expose `window.__seek(t)` for Playwright / debugging:
  ```js
  window.__seek = (t) => { reset(); render(t); };
  ```
- Animation-related setTimeouts should not span >1 second, or seek-back will get scrambled

## 6. Measuring before fonts load = wrong measurement

**The bug**: on DOMContentLoaded, the page calls `charRect(idx)` to measure bracket positions, but fonts haven't loaded — every character has fallback-font width, every position is wrong. By the time fonts load (~500ms later), the bracket's `left: Xpx` is still the old value, permanently offset.

**Rule**:
- Any layout code depending on DOM measurement (`getBoundingClientRect`, `offsetWidth`) **must** be wrapped in `document.fonts.ready.then()`
  ```js
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => {
      buildBrackets(...);  // fonts are ready now, measurement is accurate
      tick();              // start the animation
    });
  });
  ```
- The extra `requestAnimationFrame` gives the browser one frame to commit layout
- If using Google Fonts CDN, `<link rel="preconnect">` speeds up first load

## 7. Recording prep — leave handles for video export

**The bug**: Playwright `recordVideo` defaults to 25fps and starts recording from context creation. The first 2 seconds of page load and font load get recorded. The delivered video has 2 seconds of blank/flashing at the start.

**Rule**:
- Provide a `render-video.js` tool: warmup navigate → reload to restart animation → wait duration → ffmpeg trim head + transcode to H.264 MP4
- The animation's **frame 0** must be the complete initial layout already in place (not blank or loading)
- Want 60fps? Use ffmpeg `minterpolate` as post-processing — don't expect the browser's source frame rate
- Want a GIF? Two-stage palette (`palettegen` + `paletteuse`) can compress a 30s 1080p animation to 3MB

See `video-export.md` for full script invocation.

## 8. Batch export — tmp directory must include PID to avoid concurrency clashes

**The bug**: running `render-video.js` in 3 parallel processes to record 3 HTMLs. Because TMP_DIR is named with only `Date.now()`, when 3 processes start in the same millisecond they share one tmp directory. The first one to finish cleans up tmp, the other two get `ENOENT` reading the directory, all crash.

**Rule**:
- Any temp directory that multiple processes might share must include a **PID or random suffix**:
  ```js
  const TMP_DIR = path.join(DIR, '.video-tmp-' + Date.now() + '-' + process.pid);
  ```
- If you really want multi-file parallelism, use shell `&` + `wait` rather than forking inside one node script
- For batch recording multiple HTMLs, the conservative approach is **serial** (up to 2 in parallel; 3+ go in a queue)

## 9. Progress bars / replay buttons inside the recording — Chrome elements pollute the video

**The bug**: the animation HTML has a `.progress` progress bar, `.replay` replay button, `.counter` timestamp — convenient for humans debugging playback. When recorded to MP4 for delivery, these elements appear at the bottom of the video as if you'd captured devtools.

**Rule**:
- Manage "chrome elements" for humans (progress bar / replay button / footer / masthead / counter / phase labels) separately from the video content itself
- **Convention class** `.no-record`: any element with this class is auto-hidden by the recording script
- The script side (`render-video.js`) injects CSS by default hiding common chrome class names:
  ```
  .progress .counter .phases .replay .masthead .footer .no-record [data-role="chrome"]
  ```
- Inject via Playwright's `addInitScript` (applies before every navigate, stable across reloads)
- To view the raw HTML (with chrome), pass a `--keep-chrome` flag

## 10. Animation repeats at the start of the recording — warmup frame leakage

**The bug**: the old `render-video.js` flow was `goto → wait fonts 1.5s → reload → wait duration`. Recording starts at context creation; during warmup the animation already plays for a while, then reload restarts it from 0. The first few seconds of the video are "mid-animation + cut + animation from 0," strong sense of repetition.

**Rule**:
- **Warmup and Record must use independent contexts**:
  - Warmup context (no `recordVideo` option): only responsible for load url, wait fonts, then close
  - Record context (with `recordVideo`): starts fresh, animation records from t=0
- ffmpeg `-ss trim` can only shave Playwright's tiny startup latency (~0.3s) — **it can't** mask warmup frames; the source must be clean
- Closing the record context = webm written to disk; that's Playwright's constraint
- Related code pattern:
  ```js
  // Phase 1: warmup (throwaway)
  const warmupCtx = await browser.newContext({ viewport });
  const warmupPage = await warmupCtx.newPage();
  await warmupPage.goto(url, { waitUntil: 'networkidle' });
  await warmupPage.waitForTimeout(1200);
  await warmupCtx.close();

  // Phase 2: record (fresh)
  const recordCtx = await browser.newContext({ viewport, recordVideo });
  const page = await recordCtx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(DURATION * 1000);
  await page.close();
  await recordCtx.close();
  ```

## 11. Don't paint "pseudo-chrome" inside the frame — decorative player UI clashes with real chrome

**The bug**: the animation uses the `Stage` component, which already comes with scrubber + timecode + pause button (these are `.no-record` chrome, auto-hidden on export). I also painted a "`00:60 ──── CLAUDE-DESIGN / ANATOMY`" "magazine page-number-style decorative progress bar" at the bottom of the frame, feeling good about myself. **Result**: the user sees two progress bars — one from the Stage controller, one from my decoration. They visually clash, and it's diagnosed as a bug. "Why is there another progress bar inside the video?"

**Rule**:

- Stage already provides: scrubber + timecode + pause/replay buttons. **Don't paint** progress indicators, current-time codes, copyright strips, or chapter counters inside the frame — they either clash with chrome or are filler slop (violating the "earn its place" principle).
- "Page-number feel," "magazine feel," "bottom signature strip" — these **decorative urges** are high-frequency filler the AI adds automatically. Be on alert every time one appears — does it really convey irreplaceable information, or is it just filling space?
- If you're convinced some bottom strip must exist (e.g. the animation's subject is player UI), it must be **narratively necessary** and **visually distinct from the Stage scrubber** (different position, different form, different color).

**Element ownership test** (every element painted into the canvas must answer):

| What it belongs to | Treatment |
|------------|------|
| Narrative content of a specific scene | OK, keep it |
| Global chrome (control / debug) | Add `.no-record` class, hide on export |
| **Neither belongs to any scene nor is chrome** | **Delete it.** It's orphan content, definitely filler slop |

**Self-check (3 seconds before delivery)**: take a static screenshot and ask yourself —

- Is there anything in the frame that "looks like video player UI" (horizontal progress bar, timecode, button-shaped controls)?
- If yes, would deleting it hurt the narrative? If not, delete.
- Does any one category of info (progress / time / signature) appear twice? Consolidate to a single chrome location.

**Anti-example**: painting `00:42 ──── PROJECT NAME` at the bottom, painting "CH 03 / 06" chapter counter in the bottom-right, painting version "v0.3.1" along the edge — all pseudo-chrome filler.

## 12. Leading blank in the recording + recording start offset — the `__ready` × tick × lastTick triple trap

**The bug (A · leading blank)**: a 60-second animation exports an MP4 where the first 2–3 seconds are a blank page. `ffmpeg --trim=0.3` can't cut it.

**The bug (B · start offset, real incident on 2026-04-20)**: a 24-second video is exported, and the user perceives "the first frame doesn't play until 19 seconds in." What actually happened: the animation started recording from t=5, recorded until t=24, then looped back to t=0 and recorded 5 more seconds to the end — so the last 5 seconds of the video are the animation's actual beginning.

**Root cause** (both bugs share one root cause):

Playwright `recordVideo` starts writing WebM the moment `newContext()` is called, but Babel/React/font loading consumes L seconds (2–6s). The recording script waits for `window.__ready = true` as the "animation starts here" anchor — this must be strictly paired with animation `time = 0`. Two common mistakes:

| Mistake | Symptom |
|------|------|
| `__ready` is set inside `useEffect` or sync setup (before tick's first frame) | Recording script thinks the animation has started, but WebM is still capturing the blank page → **leading blank** |
| `lastTick = performance.now()` is initialized at **script top level** | Font-load L seconds get counted into first-frame `dt`, `time` jumps to L instantly → recording lags by L seconds throughout → **start offset** |

**✅ Correct full starter tick template** (hand-written animations must use this skeleton):

```js
// ━━━━━━ state ━━━━━━
let time = 0;
let playing = false;   // ❗ don't play by default; wait for fonts ready
let lastTick = null;   // ❗ sentinel — first tick frame's dt is forced to 0 (don't use performance.now())
const fired = new Set();

// ━━━━━━ tick ━━━━━━
function tick(now) {
  if (lastTick === null) {
    lastTick = now;
    window.__ready = true;   // ✅ pair: "recording start" = "animation t=0" same frame
    render(0);               // render once more to ensure DOM is ready (fonts are now ready)
    requestAnimationFrame(tick);
    return;
  }
  const dt = (now - lastTick) / 1000;   // dt only advances after the first frame
  lastTick = now;

  if (playing) {
    let t = time + dt;
    if (t >= DURATION) {
      t = window.__recording ? DURATION - 0.001 : 0;  // don't loop while recording; leave 0.001s to keep the last frame
      if (!window.__recording) fired.clear();
    }
    time = t;
    render(time);
  }
  requestAnimationFrame(tick);
}

// ━━━━━━ boot ━━━━━━
// Don't rAF immediately at top level — wait until fonts load
document.fonts.ready.then(() => {
  render(0);                 // paint the initial frame first (fonts ready)
  playing = true;
  requestAnimationFrame(tick);  // first tick pairs __ready + t=0
});

// ━━━━━━ seek interface (for defensive correction by render-video) ━━━━━━
window.__seek = (t) => { fired.clear(); time = t; lastTick = null; render(t); };
```

**Why this template is correct**:

| Step | Why it must be this way |
|------|-------------|
| `lastTick = null` + first-frame `return` | Prevents the L seconds from "script load to tick first execution" being counted into animation time |
| `playing = false` by default | While fonts load, even if `tick` runs it doesn't advance time, avoiding render misalignment |
| `__ready` set on tick's first frame | Recording script starts timing here; the matching frame is the animation's true t=0 |
| Boot tick inside `document.fonts.ready.then(...)` | Avoids fallback-font width measurement, avoids first-frame font jump |
| `window.__seek` exists | Lets `render-video.js` actively correct — a second line of defense |

**Corresponding defense on the recording script side**:
1. `addInitScript` injects `window.__recording = true` (before page goto)
2. `waitForFunction(() => window.__ready === true)`, record the offset for ffmpeg trim
3. **Additionally**: after `__ready`, actively `page.evaluate(() => window.__seek && window.__seek(0))` to force any HTML time offset to zero — this is a second line of defense for HTMLs that don't strictly follow the starter template

**Verification**: after exporting MP4
```bash
ffmpeg -i video.mp4 -ss 0 -vframes 1 frame-0.png
ffmpeg -i video.mp4 -ss $DURATION-0.1 -vframes 1 frame-end.png
```
The first frame must be the animation's t=0 initial state (not mid-animation, not black); the last frame must be the animation's terminal state (not some moment in a second loop).

**Reference implementations**: `assets/animations.jsx`'s Stage component and `scripts/render-video.js` both implement this protocol. Hand-written HTML must use the starter tick template — every line guards against a specific bug.

## 13. No looping during recording — `window.__recording` signal

**The bug**: animation Stage defaults to `loop=true` (convenient for in-browser preview). `render-video.js` waits 300ms past the duration before stopping, and during that 300ms the Stage enters the next loop. When ffmpeg `-t DURATION` cuts the clip, the last 0.5–1s lands in the next loop — the video ends abruptly back at the first frame (Scene 1), and the audience thinks the video is bugged.

**Root cause**: there's no "I'm recording" handshake between the recording script and the HTML. The HTML doesn't know it's being recorded and keeps looping as in normal browser interaction.

**Rule**:

1. **Recording script**: inject `window.__recording = true` via `addInitScript` (before page goto):
   ```js
   await recordCtx.addInitScript(() => { window.__recording = true; });
   ```

2. **Stage component**: detect this signal and force loop=false:
   ```js
   const effectiveLoop = (typeof window !== 'undefined' && window.__recording) ? false : loop;
   // ...
   if (next >= duration) return effectiveLoop ? 0 : duration - 0.001;
   //                                                       ↑ leave 0.001 to prevent Sprite end=duration from being killed
   ```

3. **Ending Sprite's fadeOut**: in the recording scenario, set `fadeOut={0}` — otherwise the video tail fades to transparent/dark. Users expect to stop on a clear final frame, not fade out. When hand-writing HTML, prefer `fadeOut={0}` for trailing Sprites.

**Reference implementations**: `assets/animations.jsx`'s Stage / `scripts/render-video.js` have the handshake built in. Hand-written Stages must implement `__recording` detection — otherwise this pitfall is guaranteed.

**Verification**: after exporting MP4, run `ffmpeg -ss 19.8 -i video.mp4 -frames:v 1 end.png` and check that the last 0.2 seconds are still the expected final frame, not a sudden cut to another scene.

## 14. 60fps video defaults to frame duplication — minterpolate has poor compatibility

**The bug**: the 60fps MP4 generated by `convert-formats.sh` with `minterpolate=fps=60:mi_mode=mci...` can't be opened in some versions of macOS QuickTime / Safari (black or refuses to open). VLC / Chrome handle it.

**Root cause**: minterpolate's H.264 elementary stream contains SEI / SPS fields some players parse incorrectly.

**Rule**:

- Default 60fps uses simple `fps=60` filter (frame duplication), broadly compatible (QuickTime/Safari/Chrome/VLC all handle it)
- High-quality interpolation is opted into with the `--minterpolate` flag — but **you must locally test** the target player before delivery
- The 60fps label's value is **algorithmic recognition by upload platforms** (Bilibili / YouTube boost 60fps-tagged content); actual perceived smoothness for CSS animations is marginal
- Add `-profile:v high -level 4.0` to improve H.264 general compatibility

**`convert-formats.sh` already defaults to compatibility mode**. If you need high-quality interpolation, add `--minterpolate`:
```bash
bash convert-formats.sh input.mp4 --minterpolate
```

## 15. `file://` + external `.jsx` CORS trap — single-file delivery must inline the engine

**The bug**: the animation HTML uses `<script type="text/babel" src="animations.jsx"></script>` to load the engine externally. Double-click open locally (`file://` protocol) → Babel Standalone XHRs for `.jsx` → Chrome reports `Cross origin requests are only supported for protocol schemes: http, https, chrome, chrome-extension...` → the whole page goes black, no `pageerror`, only a console error — easy to misdiagnose as "the animation didn't trigger."

Spinning up an HTTP server doesn't always save you either — a global proxy on the machine routes `localhost` through the proxy and returns 502 / connection failed.

**Rule**:

- **Single-file delivery (double-clickable HTML)** → `animations.jsx` must be **inlined** into a `<script type="text/babel">...</script>` tag; don't use `src="animations.jsx"`
- **Multi-file project (HTTP server demo)** → external loading is fine, but state `python3 -m http.server 8000` clearly in the delivery
- Decision criterion: is what you're delivering "an HTML file" or "a project directory with a server"? The former uses inlining
- Stage / animations.jsx is often 200+ lines — pasting into HTML `<script>` blocks is fine; don't worry about size

**Minimum verification**: double-click your generated HTML, **don't** open it through any server. If Stage shows the animation's first frame correctly, it passes.

## 16. Cross-scene inverse-color context — don't hard-code colors on in-frame elements

**The bug**: when making multi-scene animations, elements that **appear across scenes** like `ChapterLabel` / `SceneNumber` / `Watermark` had hard-coded `color: '#1A1A1A'` (dark text) in the component. Fine for the first 4 light-background scenes; on the 5th black-background scene, the "05" and watermark vanish — no error, no check triggers, critical info invisible.

**Rule**:

- Cross-scene reused in-frame elements (chapter label / scene number / timecode / watermark / copyright strip) **must not hard-code color values**
- Use one of three approaches instead:
  1. **`currentColor` inheritance**: the element only writes `color: currentColor`, the parent scene container sets `color: computed-value`
  2. **invert prop**: the component accepts `<ChapterLabel invert />` to manually toggle light/dark
  3. **auto-compute from base color**: `color: contrast-color(var(--scene-bg))` (CSS 4 new API, or JS-based decision)
- Before delivery, use Playwright to capture **a representative frame from each scene** and eyeball whether "cross-scene elements" are all visible

The insidiousness of this pitfall: **there's no bug alarm**. Only human eyes or OCR catch it.

## Pre-flight self-check (5 seconds before starting)

- [ ] Every parent of a `position: absolute` element has `position: relative`?
- [ ] All special characters in the animation (`␣` `⌘` `emoji`) exist in the font?
- [ ] Grid/Flex template count matches the JS data length?
- [ ] Scene switches use cross-fade, no >0.3s pure blank?
- [ ] DOM measurement code is wrapped in `document.fonts.ready.then()`?
- [ ] `render(t)` is pure, or has an explicit reset mechanism?
- [ ] Frame 0 is the complete initial state, not blank?
- [ ] No "pseudo-chrome" decorations inside the frame (progress bar / timecode / bottom signature strip clashing with Stage scrubber)?
- [ ] The animation tick sets `window.__ready = true` on its first frame? (Built into animations.jsx; hand-written HTML must add it)
- [ ] Stage detects `window.__recording` and forces loop=false? (Mandatory for hand-written HTML)
- [ ] Ending Sprite's `fadeOut` set to 0 (so the video ends on a clear frame)?
- [ ] 60fps MP4 defaults to frame-duplication mode (compatibility); only add `--minterpolate` for high-quality interpolation?
- [ ] After export, captured frame 0 + final frame to confirm they're the animation's initial / final states?
- [ ] Involves a specific brand (Stripe/Anthropic/Lovart/...): did you run the Core Asset Protocol (SKILL.md §1.a, five steps)? Is `brand-spec.md` written?
- [ ] Single-file delivery HTML: is `animations.jsx` inlined, not `src="..."`? (External .jsx under file:// causes a CORS black screen)
- [ ] Cross-scene elements (chapter label / watermark / scene number) have no hard-coded colors? Visible against every scene's background?
