# React + Babel Project Conventions

Technical conventions you must follow when prototyping with HTML + React + Babel. Violate them and things blow up.

## Pinned Script Tags (use exactly these versions)

Drop these three script tags into the HTML `<head>`, with **pinned versions + integrity hashes**:

```html
<script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>
```

**Do not** use unpinned versions like `react@18` or `react@latest` — they cause version drift and cache issues.

**Do not** drop the `integrity` attribute — if the CDN is hijacked or tampered with, this is your line of defense.

## File Structure

```
project-name/
├── index.html               # main HTML
├── components.jsx           # component file (loaded with type="text/babel")
├── data.js                  # data file
└── styles.css               # extra CSS (optional)
```

How to load in HTML:

```html
<!-- React + Babel first -->
<script src="https://unpkg.com/react@18.3.1/..."></script>
<script src="https://unpkg.com/react-dom@18.3.1/..."></script>
<script src="https://unpkg.com/@babel/standalone@7.29.0/..."></script>

<!-- then your component files -->
<script type="text/babel" src="components.jsx"></script>
<script type="text/babel" src="pages.jsx"></script>

<!-- finally the main entry -->
<script type="text/babel">
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<App />);
</script>
```

**Do not** use `type="module"` — it clashes with Babel.

## Three Ironclad Rules

### Rule 1: styles objects must have unique names

**Wrong** (guaranteed to blow up with multiple components):
```jsx
// components.jsx
const styles = { button: {...}, card: {...} };

// pages.jsx  ← same name, collides!
const styles = { container: {...}, header: {...} };
```

**Right**: every component file's styles uses a unique prefix.

```jsx
// terminal.jsx
const terminalStyles = { 
  screen: {...}, 
  line: {...} 
};

// sidebar.jsx
const sidebarStyles = { 
  container: {...}, 
  item: {...} 
};
```

**Or use inline styles** (recommended for small components):
```jsx
<div style={{ padding: 16, background: '#111' }}>...</div>
```

This rule is **non-negotiable**. Every time you write `const styles = {...}` you must replace it with a specific name, otherwise the whole stack reports errors when multiple components load.

### Rule 2: Scope is not shared — export manually

**Key insight**: every `<script type="text/babel">` is compiled independently by Babel, and their scopes **do not** see each other. A `Terminal` component defined in `components.jsx` is **undefined** in `pages.jsx` by default.

**Solution**: at the end of each component file, export the shared components/utilities onto `window`:

```jsx
// end of components.jsx
function Terminal(props) { ... }
function Line(props) { ... }
const colors = { green: '#...', red: '#...' };

Object.assign(window, {
  Terminal, Line, colors,
  // list everything you want to use elsewhere
});
```

Then `pages.jsx` can use `<Terminal />` directly, because JSX will look up `window.Terminal`.

### Rule 3: Do not use scrollIntoView

`scrollIntoView` shoves the entire HTML container upward and breaks the web harness layout. **Never use it.**

Alternatives:
```js
// scroll to a position inside the container
container.scrollTop = targetElement.offsetTop;

// or use element.scrollTo
container.scrollTo({
  top: targetElement.offsetTop - 100,
  behavior: 'smooth'
});
```

## Calling the Claude API (inside HTML)

Some native design-agent environments (like Claude.ai Artifacts) ship a zero-config `window.claude.complete`, but most agent environments (Claude Code / Codex / Cursor / Trae / etc.) **do not** have it locally.

If your HTML prototype needs to call an LLM for a demo (e.g. building a chat interface), you have two options:

### Option A: Don't actually call it — use a mock

Recommended for demos. Write a fake helper that returns a preset response:
```jsx
window.claude = {
  async complete(prompt) {
    await new Promise(r => setTimeout(r, 800)); // simulate latency
    return "This is a mock response. Replace with a real API call when deploying.";
  }
};
```

### Option B: Actually call the Anthropic API

Requires an API key — the user must paste their own key into the HTML for it to run. **Never hardcode a key in the HTML.**

```html
<input id="api-key" placeholder="Paste your Anthropic API key" />
<script>
window.claude = {
  async complete(prompt) {
    const key = document.getElementById('api-key').value;
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await res.json();
    return data.content[0].text;
  }
};
</script>
```

**Note**: calling the Anthropic API directly from the browser hits CORS. If the preview environment the user gives you doesn't support a CORS bypass, this path is closed. In that case use Option A's mock, or tell the user they need a proxy backend.

### Option C: Use the agent's LLM to generate mock data

If it's only for local demo use, you can temporarily call the current agent session's LLM (or a multi-model skill the user has installed) to generate mock response data, then hardcode it into the HTML. The HTML then has zero runtime API dependency.

## A Typical HTML Starter Template

Copy this template as the skeleton of a React prototype:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Prototype Name</title>

  <!-- React + Babel pinned -->
  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; width: 100%; }
    body { 
      font-family: -apple-system, 'SF Pro Text', sans-serif;
      background: #FAFAFA;
      color: #1A1A1A;
    }
    #root { min-height: 100vh; }
  </style>
</head>
<body>
  <div id="root"></div>

  <!-- your component files -->
  <script type="text/babel" src="components.jsx"></script>

  <!-- main entry -->
  <script type="text/babel">
    const { useState, useEffect } = React;

    function App() {
      return (
        <div style={{padding: 40}}>
          <h1>Hello</h1>
        </div>
      );
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<App />);
  </script>
</body>
</html>
```

## Common Errors and Fixes

**`styles is not defined` or `Cannot read property 'button' of undefined`**
→ You defined `const styles` in one file and another file overwrote it. Rename each to a specific name.

**`Terminal is not defined`**
→ Cross-file references don't share scope. Add `Object.assign(window, {Terminal})` at the end of the file that defines Terminal.

**Whole page is blank, no console errors**
→ Most likely a JSX syntax error that Babel didn't surface to the console. Temporarily swap `babel.min.js` for the unminified `babel.js` — the error message will be clearer.

**ReactDOM.createRoot is not a function**
→ Wrong version. Confirm you're using react-dom@18.3.1 (not 17 or something else).

**`Objects are not valid as a React child`**
→ You rendered an object instead of JSX/string. Usually `{someObj}` written where you meant `{someObj.name}`.

## How to Split a Large Project

A single file over **1000 lines** is hard to maintain. Split it like this:

```
project/
├── index.html
├── src/
│   ├── primitives.jsx      # base elements: Button, Card, Badge...
│   ├── components.jsx      # business components: UserCard, PostList...
│   ├── pages/
│   │   ├── home.jsx        # home page
│   │   ├── detail.jsx      # detail page
│   │   └── settings.jsx    # settings page
│   ├── router.jsx          # simple router (React state switching)
│   └── app.jsx             # entry component
└── data.js                 # mock data
```

Load them in order in HTML:
```html
<script type="text/babel" src="src/primitives.jsx"></script>
<script type="text/babel" src="src/components.jsx"></script>
<script type="text/babel" src="src/pages/home.jsx"></script>
<script type="text/babel" src="src/pages/detail.jsx"></script>
<script type="text/babel" src="src/pages/settings.jsx"></script>
<script type="text/babel" src="src/router.jsx"></script>
<script type="text/babel" src="src/app.jsx"></script>
```

**At the end of every file**, run `Object.assign(window, {...})` to export what should be shared.
