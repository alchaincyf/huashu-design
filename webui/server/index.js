import express from "express";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webuiRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webuiRoot, "..");
const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5177);

await loadLocalEnv();

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use("/skill-assets", express.static(path.join(repoRoot, "assets")));
app.use("/demos", express.static(path.join(repoRoot, "demos")));

function clip(text, max = 18000) {
  return text.length > max ? `${text.slice(0, max)}\n\n[clipped]` : text;
}

async function readText(relativePath, max) {
  const fullPath = path.join(repoRoot, relativePath);
  return clip(await fs.readFile(fullPath, "utf8"), max);
}

async function loadLocalEnv() {
  if (isProd) return;
  try {
    const envPath = path.join(repoRoot, ".env.local");
    const envText = await fs.readFile(envPath, "utf8");
    for (const line of envText.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+?)\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
      }
    }
  } catch {
    // Local Convex is optional; the save endpoint reports setup guidance.
  }
}

async function listHtml(dir) {
  try {
    const entries = await fs.readdir(path.join(repoRoot, dir));
    return entries.filter((entry) => entry.endsWith(".html")).sort();
  } catch {
    return [];
  }
}

async function buildContext(mode) {
  const [skill, workflow, styles, verification, animations, slides, landing, demos] =
    await Promise.all([
      readText("SKILL.md", 12000),
      readText("references/workflow.md", 7000),
      readText("references/design-styles.md", 8000),
      readText("references/verification.md", 5000),
      mode === "motion" ? readText("references/animations.md", 7000) : "",
      mode === "slides" ? readText("references/slide-decks.md", 7000) : "",
      mode === "prototype" ? readText("references/landing-pages.md", 7000) : "",
      listHtml("demos"),
    ]);

  return [
    "You are Huashu Design Studio, an HTML-native design agent.",
    "Use the huashu-design skill workflow, but respond with the requested artifact only.",
    "Generate complete, self-contained HTML. Inline CSS and JavaScript are preferred.",
    "Use high-quality layout, restrained interface density, real typography decisions, and clear hierarchy.",
    "Avoid generic AI design defaults: purple gradients, emoji-as-icons, decorative blobs, and fake product silhouettes.",
    "For prototypes the user calls a 'website' or 'landing page', follow the Landing Page Track: pick sections by business type, use real-feeling copy, and run the anti-slop checklist before delivery.",
    "For slide decks, use 16:9 stage sizing and keyboard navigation if relevant.",
    "For animations, expose a duration comment and keep the first frame renderable.",
    "Do not include markdown fences unless the user specifically asks for markdown.",
    "",
    "Available demo files:",
    demos.join(", "),
    "",
    "Main skill excerpt:",
    skill,
    "",
    "Workflow excerpt:",
    workflow,
    "",
    "Design styles excerpt:",
    styles,
    "",
    mode === "motion" ? `Animation excerpt:\n${animations}` : "",
    mode === "slides" ? `Slide excerpt:\n${slides}` : "",
    mode === "prototype" ? `Landing page track:\n${landing}` : "",
    "",
    "Verification excerpt:",
    verification,
  ].join("\n");
}

function providerDefaults(provider) {
  if (provider === "ollama") {
    return { baseUrl: "http://localhost:11434/v1", model: "kimi-k2.6:cloud" };
  }
  if (provider === "ollama-cloud") {
    return { baseUrl: "https://ollama.com/v1", model: "kimi-k2.6" };
  }
  if (provider === "anthropic") {
    return { baseUrl: "https://api.anthropic.com", model: "claude-sonnet-4-6" };
  }
  return { baseUrl: "https://api.openai.com/v1", model: "gpt-5.4" };
}

function resolveApiKey(provider, supplied) {
  if (supplied) return supplied;
  if (provider === "openai") return process.env.OPENAI_API_KEY || "";
  if (provider === "anthropic") return process.env.ANTHROPIC_API_KEY || "";
  if (provider === "ollama-cloud") return process.env.OLLAMA_API_KEY || "";
  return "";
}

function providerRequiresKey(provider) {
  return provider === "openai" || provider === "anthropic" || provider === "ollama-cloud";
}

function envVarNameFor(provider) {
  if (provider === "openai") return "OPENAI_API_KEY";
  if (provider === "anthropic") return "ANTHROPIC_API_KEY";
  if (provider === "ollama-cloud") return "OLLAMA_API_KEY";
  return "";
}

async function getLocalOllamaModels() {
  try {
    const response = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) return [];
    const json = await response.json();
    return (json.models || []).map((item) => item.name).filter(Boolean);
  } catch {
    return [];
  }
}

async function streamOpenAICompatible({ baseUrl, apiKey, model, system, prompt, onDelta }) {
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.7,
      stream: true,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) onDelta(delta);
      } catch {
        // tolerate malformed chunk
      }
    }
  }
}

async function streamAnthropic({ baseUrl, apiKey, model, system, prompt, onDelta }) {
  if (!apiKey) throw new Error("Anthropic requires an API key.");

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      temperature: 0.7,
      stream: true,
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";
    for (const ev of events) {
      const dataLine = ev.split("\n").find((line) => line.startsWith("data:"));
      if (!dataLine) continue;
      const payload = dataLine.slice(5).trim();
      if (!payload) continue;
      try {
        const json = JSON.parse(payload);
        if (json.type === "content_block_delta" && json.delta?.type === "text_delta") {
          onDelta(json.delta.text);
        }
      } catch {
        // tolerate malformed chunk
      }
    }
  }
}

function stripFence(output) {
  const trimmed = output.trim();
  const match = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

function getConvexHttpUrl() {
  const explicit = process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) return "";
  return convexUrl.replace(/\/$/, "").replace(".convex.cloud", ".convex.site");
}

function newShareId(title = "mockup") {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36) || "mockup";
  return `${slug}-${crypto.randomBytes(4).toString("hex")}`;
}

async function convexRequest(pathname, init) {
  const baseUrl = getConvexHttpUrl();
  if (!baseUrl) {
    const error = new Error("Convex is not configured. Set CONVEX_HTTP_URL to your Convex .convex.site URL.");
    error.status = 503;
    throw error;
  }

  const response = await fetch(`${baseUrl}${pathname}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Convex request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

app.get("/api/context", async (_req, res, next) => {
  try {
    const [demos, showcases] = await Promise.all([
      listHtml("demos"),
      fs
        .readdir(path.join(repoRoot, "assets", "showcases"), { withFileTypes: true })
        .then((entries) => entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name))
        .catch(() => []),
    ]);
    res.json({ repoRoot, demos, showcases });
  } catch (error) {
    next(error);
  }
});

app.get("/api/ollama-models", async (_req, res) => {
  res.json({ models: await getLocalOllamaModels() });
});

app.post("/api/generate", async (req, res) => {
  const provider = (req.body && req.body.provider) || "ollama";
  const body = req.body || {};
  const defaults = providerDefaults(provider);
  const baseUrl = body.baseUrl || defaults.baseUrl;
  let model = body.model || defaults.model;
  const prompt = String(body.prompt || "").trim();
  const mode = body.mode || "prototype";
  const apiKey = resolveApiKey(provider, body.apiKey);

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }
  if (providerRequiresKey(provider) && !apiKey) {
    const envName = envVarNameFor(provider);
    return res.status(400).json({
      error: `${provider} requires an API key. Enter one in the API key field or set ${envName} in webui/.env.local (or the repo root .env.local).`,
    });
  }
  if (provider === "ollama") {
    const localModels = await getLocalOllamaModels();
    if (localModels.length && !localModels.includes(model)) {
      model = localModels[0];
    }
  }

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  const writeEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const system = await buildContext(mode);
    const fullPrompt = [
      `Mode: ${mode}`,
      "Return a complete HTML document that can be loaded in an iframe preview.",
      "If the user asks for variants, include an in-page variant selector.",
      "",
      prompt,
    ].join("\n");

    writeEvent("start", { provider, model });

    const stream = provider === "anthropic" ? streamAnthropic : streamOpenAICompatible;
    await stream({
      baseUrl,
      apiKey,
      model,
      system,
      prompt: fullPrompt,
      onDelta: (delta) => writeEvent("delta", { text: delta }),
    });

    writeEvent("done", { provider, model });
    res.end();
  } catch (error) {
    let message = error.message || "Unexpected server error";
    if (/^401\b/.test(message)) {
      const envName = envVarNameFor(provider) || "the provider's API key";
      message = `Provider rejected the API key (401). Double-check the key for ${provider}, or update ${envName} in .env.local.`;
    }
    writeEvent("error", { error: message });
    res.end();
  }
});

app.get("/api/mockups", async (req, res, next) => {
  try {
    const id = req.query.id ? String(req.query.id) : "";
    if (id) {
      const data = await convexRequest(`/mockups?id=${encodeURIComponent(id)}`, { method: "GET" });
      return res.json(data);
    }
    const limit = req.query.limit ? `?limit=${encodeURIComponent(String(req.query.limit))}` : "";
    const data = await convexRequest(`/mockups${limit}`, { method: "GET" });
    const origin = `${req.protocol}://${req.get("host")}`;
    const mockups = (data.mockups || []).map((mockup) => ({
      ...mockup,
      shareUrl: `${origin}/mockup/${mockup.shareId}`,
    }));
    res.json({ mockups });
  } catch (error) {
    next(error);
  }
});

app.post("/api/mockups", async (req, res, next) => {
  try {
    const body = req.body || {};
    const title = String(body.title || body.clientName || "Client mockup").trim();
    const shareId = body.shareId || newShareId(title);
    const data = await convexRequest("/mockups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shareId,
        title,
        clientName: body.clientName,
        contact: body.contact,
        prompt: body.prompt,
        html: body.html,
        status: body.status || "draft",
      }),
    });

    res.json({
      ...data,
      shareId,
      shareUrl: `${req.protocol}://${req.get("host")}/mockup/${shareId}`,
    });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/mockups", async (req, res, next) => {
  try {
    const body = req.body || {};
    if (!body.shareId) return res.status(400).json({ error: "shareId is required." });
    const data = await convexRequest("/mockups", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    res.json({
      ...data,
      shareUrl: `${req.protocol}://${req.get("host")}/mockup/${body.shareId}`,
    });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/mockups", async (req, res, next) => {
  try {
    const id = req.query.id ? String(req.query.id) : "";
    if (!id) return res.status(400).json({ error: "id is required." });
    const data = await convexRequest(`/mockups?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

if (isProd) {
  app.use(express.static(path.join(webuiRoot, "dist")));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(webuiRoot, "dist", "index.html"));
  });
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root: webuiRoot,
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.use((error, _req, res, _next) => {
  res.status(500).json({ error: error.message || "Unexpected server error" });
});

app.listen(port, () => {
  console.log(`Huashu Design Studio running at http://localhost:${port}`);
});
