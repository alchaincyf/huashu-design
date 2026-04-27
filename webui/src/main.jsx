import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const providerPresets = {
  ollama: {
    label: "Ollama Local",
    baseUrl: "http://localhost:11434/v1",
    model: "kimi-k2.6:cloud",
    keyPlaceholder: "optional",
  },
  "ollama-cloud": {
    label: "Ollama Cloud",
    baseUrl: "https://ollama.com/v1",
    model: "kimi-k2.6",
    keyPlaceholder: "ollama key",
  },
  openai: {
    label: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-5.4",
    keyPlaceholder: "sk-...",
  },
  anthropic: {
    label: "Anthropic",
    baseUrl: "https://api.anthropic.com",
    model: "claude-sonnet-4-6",
    keyPlaceholder: "sk-ant-...",
  },
  custom: {
    label: "Custom",
    baseUrl: "http://localhost:1234/v1",
    model: "local-model",
    keyPlaceholder: "optional",
  },
};

const starterHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Huashu Design Preview</title>
  <style>
    body { margin: 0; font-family: Inter, ui-sans-serif, system-ui, sans-serif; background: #f7f3ea; color: #161616; }
    .stage { min-height: 100vh; display: grid; place-items: center; padding: 48px; }
    main { width: min(980px, 100%); display: grid; gap: 24px; }
    h1 { font-size: clamp(44px, 7vw, 92px); line-height: .95; margin: 0; letter-spacing: 0; }
    p { font-size: 20px; line-height: 1.5; max-width: 680px; margin: 0; color: #45423c; }
    .bar { height: 12px; background: linear-gradient(90deg, #1e1e1e 0 42%, #d94f30 42% 68%, #2f735f 68%); border-radius: 999px; }
  </style>
</head>
<body>
  <section class="stage">
    <main>
      <div class="bar"></div>
      <h1>Huashu Design Studio</h1>
      <p>Choose a provider, describe the artifact, then generate a complete HTML design for this preview.</p>
    </main>
  </section>
</body>
</html>`;

function getStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem("huashu-webui-settings") || "{}");
  } catch {
    return {};
  }
}

function App() {
  const stored = useMemo(getStoredSettings, []);
  const [provider, setProvider] = useState(stored.provider || "ollama");
  const [baseUrl, setBaseUrl] = useState(stored.baseUrl || providerPresets.ollama.baseUrl);
  const [model, setModel] = useState(stored.model || providerPresets.ollama.model);
  const [apiKey, setApiKey] = useState("");
  const [mode, setMode] = useState(stored.mode || "prototype");
  const [prompt, setPrompt] = useState(
    stored.prompt ||
      "Create a clickable iOS-style onboarding prototype for a focus timer app. Include 3 screens, stateful navigation, and one polished visual direction."
  );
  const [html, setHtml] = useState(starterHtml);
  const [tab, setTab] = useState("preview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState(null);
  const [ollamaModels, setOllamaModels] = useState([]);

  useEffect(() => {
    fetch("/api/context")
      .then((response) => response.json())
      .then(setContext)
      .catch(() => {});
    fetch("/api/ollama-models")
      .then((response) => response.json())
      .then((data) => {
        const models = data.models || [];
        setOllamaModels(models);
        if (!stored.model && models.length) setModel(models[0]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "huashu-webui-settings",
      JSON.stringify({ provider, baseUrl, model, mode, prompt })
    );
  }, [provider, baseUrl, model, apiKey, mode, prompt]);

  function chooseProvider(nextProvider) {
    setProvider(nextProvider);
    const preset = providerPresets[nextProvider];
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
  }

  async function generate() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, baseUrl, model, apiKey, mode, prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Generation failed");
      setHtml(data.html);
      setTab("preview");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const preset = providerPresets[provider];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <img src="/skill-assets/banner.svg" alt="" />
          <div>
            <strong>Huashu Studio</strong>
            <span>{context ? `${context.demos.length} demos loaded` : "Loading skill"}</span>
          </div>
        </div>

        <section className="panel">
          <label>Provider</label>
          <div className="segmented">
            {Object.entries(providerPresets).map(([key, item]) => (
              <button
                key={key}
                className={provider === key ? "active" : ""}
                onClick={() => chooseProvider(key)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel grid">
          <label htmlFor="base-url">Base URL</label>
          <input id="base-url" value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} />

          <label htmlFor="model">Model</label>
          <input id="model" value={model} onChange={(event) => setModel(event.target.value)} />
          {provider === "ollama" && ollamaModels.length ? (
            <select value={model} onChange={(event) => setModel(event.target.value)}>
              {ollamaModels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          ) : null}

          <label htmlFor="api-key">API key</label>
          <input
            id="api-key"
            type="password"
            value={apiKey}
            placeholder={preset.keyPlaceholder}
            onChange={(event) => setApiKey(event.target.value)}
          />
        </section>

        <section className="panel">
          <label>Artifact</label>
          <div className="mode-grid">
            {["prototype", "slides", "motion", "infographic", "review"].map((item) => (
              <button key={item} className={mode === item ? "active" : ""} onClick={() => setMode(item)} type="button">
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="panel grow">
          <label htmlFor="prompt">Brief</label>
          <textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
        </section>

        {error ? <div className="error">{error}</div> : null}

        <button className="primary" onClick={generate} disabled={busy} type="button">
          {busy ? "Generating..." : "Generate HTML"}
        </button>
      </aside>

      <main className="workspace">
        <header className="toolbar">
          <div>
            <strong>{mode}</strong>
            <span>{model}</span>
          </div>
          <div className="tabs">
            <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")} type="button">
              Preview
            </button>
            <button className={tab === "code" ? "active" : ""} onClick={() => setTab("code")} type="button">
              Code
            </button>
            <button className={tab === "demos" ? "active" : ""} onClick={() => setTab("demos")} type="button">
              Demos
            </button>
          </div>
        </header>

        <section className="canvas">
          {tab === "preview" ? <iframe title="Generated preview" srcDoc={html} sandbox="allow-scripts" /> : null}
          {tab === "code" ? <textarea className="code-editor" value={html} onChange={(event) => setHtml(event.target.value)} /> : null}
          {tab === "demos" ? (
            <div className="demo-grid">
              {(context?.demos || []).map((demo) => (
                <a key={demo} href={`/demos/${demo}`} target="_blank" rel="noreferrer">
                  {demo.replace(".html", "")}
                </a>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
