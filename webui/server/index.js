import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webuiRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webuiRoot, "..");
const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5177);

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

async function listHtml(dir) {
  try {
    const entries = await fs.readdir(path.join(repoRoot, dir));
    return entries.filter((entry) => entry.endsWith(".html")).sort();
  } catch {
    return [];
  }
}

async function buildContext(mode) {
  const [skill, workflow, styles, verification, animations, slides, demos] =
    await Promise.all([
      readText("SKILL.md", 12000),
      readText("references/workflow.md", 7000),
      readText("references/design-styles.md", 8000),
      readText("references/verification.md", 5000),
      mode === "motion" ? readText("references/animations.md", 7000) : "",
      mode === "slides" ? readText("references/slide-decks.md", 7000) : "",
      listHtml("demos"),
    ]);

  return [
    "You are Huashu Design Studio, an HTML-native design agent.",
    "Use the huashu-design skill workflow, but respond with the requested artifact only.",
    "Generate complete, self-contained HTML. Inline CSS and JavaScript are preferred.",
    "Use high-quality layout, restrained interface density, real typography decisions, and clear hierarchy.",
    "Avoid generic AI design defaults: purple gradients, emoji-as-icons, decorative blobs, and fake product silhouettes.",
    "For clickable prototypes, make the interactions work in the HTML.",
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

async function callOpenAICompatible({ baseUrl, apiKey, model, system, prompt }) {
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      temperature: 0.7,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }

  const json = JSON.parse(text);
  return json.choices?.[0]?.message?.content || "";
}

async function callAnthropic({ baseUrl, apiKey, model, system, prompt }) {
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
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }

  const json = JSON.parse(text);
  return json.content?.map((part) => part.text || "").join("") || "";
}

function stripFence(output) {
  const trimmed = output.trim();
  const match = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
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

app.post("/api/generate", async (req, res, next) => {
  try {
    const body = req.body || {};
    const provider = body.provider || "ollama";
    const defaults = providerDefaults(provider);
    const baseUrl = body.baseUrl || defaults.baseUrl;
    let model = body.model || defaults.model;
    const prompt = String(body.prompt || "").trim();
    const mode = body.mode || "prototype";

    if (!prompt) throw new Error("Prompt is required.");
    if (provider === "ollama") {
      const localModels = await getLocalOllamaModels();
      if (localModels.length && !localModels.includes(model)) {
        model = localModels[0];
      }
    }

    const system = await buildContext(mode);
    const fullPrompt = [
      `Mode: ${mode}`,
      "Return a complete HTML document that can be loaded in an iframe preview.",
      "If the user asks for variants, include an in-page variant selector.",
      "",
      prompt,
    ].join("\n");

    const generated =
      provider === "anthropic"
        ? await callAnthropic({ baseUrl, apiKey: body.apiKey, model, system, prompt: fullPrompt })
        : await callOpenAICompatible({ baseUrl, apiKey: body.apiKey, model, system, prompt: fullPrompt });

    res.json({ html: stripFence(generated), model, provider });
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
