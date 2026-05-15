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

const steps = [
  { id: "lead", label: "Lead" },
  { id: "direction", label: "Direction" },
  { id: "ai", label: "AI" },
  { id: "ship", label: "Ship" },
];

const artifactOptions = [
  { id: "prototype", label: "Website", hint: "Client-ready landing mockup" },
  { id: "slides", label: "Pitch deck", hint: "16:9 presentation" },
  { id: "motion", label: "Motion", hint: "Promo animation concept" },
  { id: "infographic", label: "One-pager", hint: "Static sales visual" },
  { id: "review", label: "Review", hint: "Critique an existing design" },
];

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

function stripFenceClient(output) {
  const trimmed = output.trim();
  const match = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function getStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem("huashu-webui-settings") || "{}");
  } catch {
    return {};
  }
}

function App() {
  const shareMatch = window.location.pathname.match(/^\/mockup\/([^/]+)$/);
  if (shareMatch) return <ClientMockup shareId={shareMatch[1]} />;

  const stored = useMemo(getStoredSettings, []);
  const [provider, setProvider] = useState(stored.provider || "ollama");
  const [baseUrl, setBaseUrl] = useState(stored.baseUrl || providerPresets.ollama.baseUrl);
  const [model, setModel] = useState(stored.model || providerPresets.ollama.model);
  const [apiKey, setApiKey] = useState("");
  const [mode, setMode] = useState(stored.mode || "prototype");
  const [prompt, setPrompt] = useState(
    stored.prompt ||
      "Build a modern local-business website mockup for a restaurant lead. Use real-looking sections for hero, menu highlights, gallery, reviews, opening hours, and booking/contact CTAs. Make it polished enough to send as a preview link."
  );
  const [clientName, setClientName] = useState(stored.clientName || "");
  const [contact, setContact] = useState(stored.contact || "");
  const [shareLink, setShareLink] = useState("");
  const [currentShareId, setCurrentShareId] = useState("");
  const [savedStatus, setSavedStatus] = useState("");
  const [mockupList, setMockupList] = useState([]);
  const [mockupListError, setMockupListError] = useState("");
  const [html, setHtml] = useState(starterHtml);
  const [step, setStep] = useState("lead");
  const [tab, setTab] = useState("preview");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState(null);
  const [ollamaModels, setOllamaModels] = useState([]);
  const [streamChars, setStreamChars] = useState(0);
  const [streamElapsed, setStreamElapsed] = useState(0);
  const [streamStatus, setStreamStatus] = useState("");

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
      JSON.stringify({ provider, baseUrl, model, mode, prompt, clientName, contact })
    );
  }, [provider, baseUrl, model, apiKey, mode, prompt, clientName, contact]);

  useEffect(() => {
    if (tab === "saved") refreshMockups();
  }, [tab]);

  function chooseProvider(nextProvider) {
    setProvider(nextProvider);
    const preset = providerPresets[nextProvider];
    setBaseUrl(preset.baseUrl);
    setModel(preset.model);
  }

  async function generate() {
    setBusy(true);
    setError("");
    setStreamChars(0);
    setStreamElapsed(0);
    setStreamStatus("Connecting...");
    setTab("preview");

    const startedAt = Date.now();
    const tickInterval = setInterval(() => {
      setStreamElapsed(Math.round((Date.now() - startedAt) / 1000));
    }, 250);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, baseUrl, model, apiKey, mode, prompt }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!response.ok || !contentType.includes("event-stream")) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Generation failed (${response.status})`);
      }

      setStreamStatus("Streaming...");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let lastFlush = 0;
      let streamError = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";
        for (const ev of events) {
          let eventName = "message";
          let dataStr = "";
          for (const line of ev.split("\n")) {
            if (line.startsWith("event:")) eventName = line.slice(6).trim();
            else if (line.startsWith("data:")) dataStr += line.slice(5).trim();
          }
          if (!dataStr) continue;
          let payload;
          try {
            payload = JSON.parse(dataStr);
          } catch {
            continue;
          }
          if (eventName === "error") {
            streamError = payload.error || "Generation failed";
            break;
          }
          if (eventName === "delta" && payload.text) {
            acc += payload.text;
            const now = Date.now();
            if (now - lastFlush > 250) {
              setHtml(stripFenceClient(acc));
              setStreamChars(acc.length);
              lastFlush = now;
            }
          }
        }
        if (streamError) break;
      }

      if (streamError) throw new Error(streamError);

      const finalHtml = stripFenceClient(acc);
      setHtml(finalHtml);
      setStreamChars(acc.length);
      setStreamStatus("");
      setStep("ship");

      try {
        const saved = await autoSaveDraft(finalHtml);
        if (saved?.shareId) {
          setCurrentShareId(saved.shareId);
          setSavedStatus("draft");
          setShareLink("");
        }
      } catch (autoSaveError) {
        setError(`Generated, but auto-save failed: ${autoSaveError.message}`);
      }
    } catch (err) {
      setError(err.message);
      setStreamStatus("");
    } finally {
      clearInterval(tickInterval);
      setBusy(false);
    }
  }

  function mockupTitle() {
    return clientName ? `${clientName} website mockup` : "Client website mockup";
  }

  async function autoSaveDraft(htmlForSave) {
    const response = await fetch("/api/mockups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shareId: currentShareId || undefined,
        title: mockupTitle(),
        clientName,
        contact,
        prompt,
        html: htmlForSave,
        status: "draft",
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not save draft");
    return data;
  }

  async function saveClientLink() {
    setBusy(true);
    setError("");
    setShareLink("");
    try {
      let data;
      if (currentShareId) {
        const response = await fetch("/api/mockups", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shareId: currentShareId,
            title: mockupTitle(),
            clientName,
            contact,
            html,
            status: "review",
          }),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not update mockup");
      } else {
        const response = await fetch("/api/mockups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: mockupTitle(),
            clientName,
            contact,
            prompt,
            html,
            status: "review",
          }),
        });
        data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not save mockup");
        if (data.shareId) setCurrentShareId(data.shareId);
      }
      setSavedStatus("review");
      setShareLink(data.shareUrl);
      await navigator.clipboard?.writeText(data.shareUrl).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshMockups() {
    setMockupListError("");
    try {
      const response = await fetch("/api/mockups");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load mockups");
      setMockupList(data.mockups || []);
    } catch (err) {
      setMockupListError(err.message);
    }
  }

  async function loadMockup(shareId) {
    setError("");
    try {
      const response = await fetch(`/api/mockups?id=${encodeURIComponent(shareId)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load mockup");
      const mockup = data.mockup;
      setHtml(mockup.html);
      setCurrentShareId(mockup.shareId);
      setSavedStatus(mockup.status || "");
      setClientName(mockup.clientName || "");
      setContact(mockup.contact || "");
      if (mockup.prompt) setPrompt(mockup.prompt);
      setShareLink(`${window.location.origin}/mockup/${mockup.shareId}`);
      setStep("ship");
      setTab("preview");
    } catch (err) {
      setError(err.message);
    }
  }

  async function deleteMockup(shareId) {
    if (!window.confirm("Delete this mockup? This cannot be undone.")) return;
    setMockupListError("");
    try {
      const response = await fetch(`/api/mockups?id=${encodeURIComponent(shareId)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not delete mockup");
      setMockupList((items) => items.filter((item) => item.shareId !== shareId));
      if (shareId === currentShareId) {
        setCurrentShareId("");
        setSavedStatus("");
        setShareLink("");
      }
    } catch (err) {
      setMockupListError(err.message);
    }
  }

  const preset = providerPresets[provider];
  const activeStepIndex = steps.findIndex((item) => item.id === step);

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

        <nav className="stepper" aria-label="Workflow">
          {steps.map((item, index) => (
            <button
              key={item.id}
              className={step === item.id ? "active" : index < activeStepIndex ? "done" : ""}
              onClick={() => setStep(item.id)}
              type="button"
            >
              <span>{index + 1}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {step === "lead" ? (
          <section className="panel grow">
            <div className="section-title">
              <label>Prospect</label>
              <p>Capture only what makes the preview feel made for them.</p>
            </div>
            <input
              value={clientName}
              placeholder="Business name, e.g. Jones Barbecue"
              onChange={(event) => setClientName(event.target.value)}
            />
            <input
              value={contact}
              placeholder="Current site, Instagram, or phone"
              onChange={(event) => setContact(event.target.value)}
            />
            <button className="primary" onClick={() => setStep("direction")} type="button">
              Continue
            </button>
          </section>
        ) : null}

        {step === "direction" ? (
          <section className="panel grow">
            <div className="section-title">
              <label>Offer</label>
              <p>Pick what Jude is sending the prospect.</p>
            </div>
            <div className="choice-list">
              {artifactOptions.map((item) => (
                <button key={item.id} className={mode === item.id ? "active" : ""} onClick={() => setMode(item.id)} type="button">
                  <strong>{item.label}</strong>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
            <label htmlFor="prompt">Creative brief</label>
            <textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} />
            <button className="primary" onClick={() => setStep("ai")} type="button">
              Continue
            </button>
          </section>
        ) : null}

        {step === "ai" ? (
          <section className="panel grow">
            <div className="section-title">
              <label>Model</label>
              <p>Select the engine only when you need to change it.</p>
            </div>
            <div className="choice-list compact">
              {Object.entries(providerPresets).map(([key, item]) => (
                <button key={key} className={provider === key ? "active" : ""} onClick={() => chooseProvider(key)} type="button">
                  <strong>{item.label}</strong>
                  <span>{item.model}</span>
                </button>
              ))}
            </div>
            <details className="advanced">
              <summary>Advanced provider settings</summary>
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
            </details>
            <label htmlFor="api-key">API key</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              placeholder={preset.keyPlaceholder}
              onChange={(event) => setApiKey(event.target.value)}
            />
            <button className="primary" onClick={generate} disabled={busy} type="button">
              {busy ? "Generating..." : "Generate mockup"}
            </button>
          </section>
        ) : null}

        {step === "ship" ? (
          <section className="panel grow">
            <div className="section-title">
              <label>Client link</label>
              <p>Review the preview, then publish a durable link for the prospect.</p>
            </div>
            <div className="status-card">
              <strong>{clientName || "Client mockup"}</strong>
              <span>
                {savedStatus === "review"
                  ? "Published — link ready to send"
                  : savedStatus === "draft"
                  ? "Auto-saved as draft (private)"
                  : "Not saved yet"}
              </span>
            </div>
            <button className="secondary" onClick={() => setStep("direction")} type="button">
              Revise brief
            </button>
            <button className="primary" onClick={saveClientLink} disabled={busy || !html} type="button">
              {busy
                ? "Saving..."
                : savedStatus === "review"
                ? "Re-publish update"
                : "Publish client link"}
            </button>
            {shareLink ? (
              <a className="share-link" href={shareLink} target="_blank" rel="noreferrer">
                {shareLink}
              </a>
            ) : null}
          </section>
        ) : null}

        {error ? <div className="error">{error}</div> : null}
      </aside>

      <main className="workspace">
        <header className="toolbar">
          <div>
            <strong>{clientName || artifactOptions.find((item) => item.id === mode)?.label || mode}</strong>
            <span>{providerPresets[provider]?.label} · {model}</span>
          </div>
          <div className="tabs">
            <button className={tab === "preview" ? "active" : ""} onClick={() => setTab("preview")} type="button">
              Preview
            </button>
            <button className={tab === "code" ? "active" : ""} onClick={() => setTab("code")} type="button">
              Code
            </button>
            <button className={tab === "saved" ? "active" : ""} onClick={() => setTab("saved")} type="button">
              Saved
            </button>
            <button className={tab === "demos" ? "active" : ""} onClick={() => setTab("demos")} type="button">
              Demos
            </button>
          </div>
        </header>

        <section className="canvas">
          {tab === "preview" ? (
            <div className="preview-wrap">
              <iframe title="Generated preview" srcDoc={html} sandbox="allow-scripts" />
              {busy ? (
                <div className="stream-overlay" role="status" aria-live="polite">
                  <div className="stream-pulse" />
                  <strong>{streamStatus || "Generating"}</strong>
                  <span>
                    {streamElapsed}s elapsed · {streamChars.toLocaleString()} chars streamed
                  </span>
                  <small>The preview updates as the model writes the page.</small>
                </div>
              ) : null}
            </div>
          ) : null}
          {tab === "code" ? <textarea className="code-editor" value={html} onChange={(event) => setHtml(event.target.value)} /> : null}
          {tab === "saved" ? (
            <div className="mockup-list">
              <header className="mockup-list-head">
                <div>
                  <strong>Saved mockups</strong>
                  <span>{mockupList.length} total</span>
                </div>
                <button className="secondary" onClick={refreshMockups} type="button">
                  Refresh
                </button>
              </header>
              {mockupListError ? <div className="error">{mockupListError}</div> : null}
              {mockupList.length === 0 ? (
                <p className="muted">
                  Generate a mockup — drafts auto-save here. Publish from the Ship step to share.
                </p>
              ) : (
                <ul>
                  {mockupList.map((item) => (
                    <li key={item.shareId} className={item.shareId === currentShareId ? "current" : ""}>
                      <div className="mockup-meta">
                        <strong>{item.title}</strong>
                        <span>
                          <span className={`status-pill status-${item.status}`}>{item.status}</span>
                          {item.clientName ? ` · ${item.clientName}` : ""}
                          {" · "}
                          {new Date(item.updatedAt).toLocaleString()}
                          {" · "}
                          {Math.round((item.htmlSize || 0) / 100) / 10}KB
                        </span>
                      </div>
                      <div className="mockup-actions">
                        <button onClick={() => loadMockup(item.shareId)} type="button">
                          Load
                        </button>
                        {item.shareUrl ? (
                          <a href={item.shareUrl} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        ) : null}
                        <button className="danger" onClick={() => deleteMockup(item.shareId)} type="button">
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
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

function ClientMockup({ shareId }) {
  const [mockup, setMockup] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/mockups?id=${encodeURIComponent(shareId)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Mockup not found");
        setMockup(data.mockup);
      })
      .catch((err) => setError(err.message));
  }, [shareId]);

  if (error) {
    return (
      <main className="public-state">
        <h1>Mockup unavailable</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!mockup) {
    return (
      <main className="public-state">
        <h1>Loading mockup</h1>
      </main>
    );
  }

  return (
    <main className="public-viewer">
      <header>
        <div>
          <span>Website preview</span>
          <strong>{mockup.clientName || mockup.title}</strong>
        </div>
        <nav>
          <a href={`mailto:?subject=${encodeURIComponent(mockup.title)}&body=${encodeURIComponent(window.location.href)}`}>
            Share
          </a>
          <a href="#preview">
            Full preview
          </a>
        </nav>
      </header>
      <iframe id="preview" title={mockup.title} srcDoc={mockup.html} sandbox="allow-scripts" />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
