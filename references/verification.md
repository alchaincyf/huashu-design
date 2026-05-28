# Verification: Output Verification Workflow

Some design-agent native environments (like Claude.ai Artifacts) have a built-in `fork_verifier_agent` that spawns a subagent to screenshot through an iframe. Most agent environments (Claude Code / Codex / Cursor / Trae / etc.) don't have this built in — doing it manually with Playwright covers the same verification scenarios.

## Verification Checklist

After every HTML output, walk through this list:

### 1. Browser render check (mandatory)

Most basic: **does the HTML even open**? On macOS:

```bash
open -a "Google Chrome" "/path/to/your/design.html"
```

Or screenshot with Playwright (next section).

### 2. Console error check

The most common HTML file problem is a JS error producing a white screen. Run Playwright once:

```bash
python ~/.claude/skills/claude-design/scripts/verify.py path/to/design.html
```

This script:
1. Opens the HTML in headless Chromium
2. Saves a screenshot to the project directory
3. Captures console errors
4. Reports status

See `scripts/verify.py` for details.

### 3. Multi-viewport check

For responsive designs, capture multiple viewports:

```bash
python verify.py design.html --viewports 1920x1080,1440x900,768x1024,375x667
```

### 4. Interaction check

Tweaks, animations, button toggles — static screenshots can't see these. **Recommended: have the user open the browser and click through themselves**, or record video with Playwright:

```python
page.video.record('interaction.mp4')
```

### 5. Per-slide check for slide decks

Deck-style HTML, capture each:

```bash
python verify.py deck.html --slides 10  # capture first 10
```

Produces `deck-slide-01.png`, `deck-slide-02.png`... for quick browsing.

## Playwright Setup

First-time setup:

```bash
# If not installed
npm install -g playwright
npx playwright install chromium

# Or Python version
pip install playwright
playwright install chromium
```

If the user already has Playwright installed globally, use it directly.

## Screenshot Best Practices

### Full page

```python
page.screenshot(path='full.png', full_page=True)
```

### Viewport only

```python
page.screenshot(path='viewport.png')  # default: visible area only
```

### Specific element

```python
element = page.query_selector('.hero-section')
element.screenshot(path='hero.png')
```

### Hi-res screenshot

```python
page = browser.new_page(device_scale_factor=2)  # retina
```

### Wait for animation to finish before capturing

```python
page.wait_for_timeout(2000)  # 2 seconds for animation to settle
page.screenshot(...)
```

## Sending Screenshots to the User

### Open the local screenshot directly

```bash
open screenshot.png
```

The user views in their own Preview / Figma / VSCode / browser.

### Upload to image host, share a link

If you need to share with remote collaborators (e.g., Slack / Feishu / WeChat), have the user use their own image host tool or MCP to upload:

```bash
python ~/Documents/writing/tools/upload_image.py screenshot.png
```

Returns an ImgBB permanent link that can be pasted anywhere.

## When Verification Fails

### Blank page

There's definitely a console error. Check first:

1. React+Babel script tag integrity hashes (see `react-setup.md`)
2. Whether `const styles = {...}` name collisions exist
3. Whether cross-file components were exported to `window`
4. JSX syntax errors (babel.min.js doesn't report errors — swap in the unminified babel.js)

### Animation stutters

- Record a clip with Chrome DevTools Performance tab
- Look for layout thrashing (frequent reflow)
- Prefer `transform` and `opacity` for motion (GPU-accelerated)

### Wrong font

- Check whether the `@font-face` url is reachable
- Check fallback fonts
- Chinese fonts load slowly: show fallback first, switch after load

### Layout broken

- Check whether `box-sizing: border-box` is applied globally
- Check `*  margin: 0; padding: 0` reset
- Open gridlines in Chrome DevTools to see actual layout

## Verification = the Designer's Second Pair of Eyes

**Always go over it yourself**. When AI writes code, these things happen often:

- Looks right but interaction has a bug
- Static screenshot looks good but breaks while scrolling
- Looks great on wide screens, collapses on narrow
- Forgot to test dark mode
- After toggling Tweaks, some components didn't respond

**The last 1 minute of verification saves 1 hour of rework**.

## Common Verification Script Commands

```bash
# Basic: open + screenshot + capture errors
python verify.py design.html

# Multiple viewports
python verify.py design.html --viewports 1920x1080,375x667

# Multiple slides
python verify.py deck.html --slides 10

# Output to a specific directory
python verify.py design.html --output ./screenshots/

# headless=false, show a real browser
python verify.py design.html --show
```
