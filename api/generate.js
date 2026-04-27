const fs = require("node:fs/promises");
const path = require("node:path");

function clip(text, max = 18000) {
  return text.length > max ? `${text.slice(0, max)}\n\n[clipped]` : text;
}

async function readText(relativePath, max) {
  return clip(await fs.readFile(path.join(process.cwd(), relativePath), "utf8"), max);
}

async function listHtml(dir) {
  try {
    const entries = await fs.readdir(path.join(process.cwd(), dir));
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
    "Generate complete, self-contained HTML. Inline CSS and JavaScript are preferred.",
    "Avoid generic AI design defaults: purple gradients, emoji-as-icons, decorative blobs, and fake product silhouettes.",
    "For prototypes the user calls a 'website' or 'landing page', follow the Landing Page Track: pick sections by business type, use real-feeling copy, and run the anti-slop checklist before delivery.",
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

async function callOpenAICompatible({ baseUrl, apiKey, model, system, prompt }) {
  const headers = { "Content-Type": "application/json" };
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
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
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
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
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  const json = JSON.parse(text);
  return json.content?.map((part) => part.text || "").join("") || "";
}

function stripFence(output) {
  const trimmed = output.trim();
  const match = trimmed.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const provider = (req.body && req.body.provider) || "ollama";

  try {
    const body = req.body || {};
    const baseUrl =
      body.baseUrl ||
      (provider === "anthropic"
        ? "https://api.anthropic.com"
        : provider === "ollama"
          ? "http://localhost:11434/v1"
          : provider === "ollama-cloud"
            ? "https://ollama.com/v1"
          : "https://api.openai.com/v1");
    const model =
      body.model ||
      (provider === "anthropic"
        ? "claude-sonnet-4-6"
        : provider === "ollama"
          ? "kimi-k2.6:cloud"
          : provider === "ollama-cloud"
            ? "kimi-k2.6"
            : "gpt-5.4");
    const mode = body.mode || "prototype";
    const prompt = String(body.prompt || "").trim();
    const apiKey = resolveApiKey(provider, body.apiKey);

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }
    if (providerRequiresKey(provider) && !apiKey) {
      const envName = envVarNameFor(provider);
      return res.status(400).json({
        error: `${provider} requires an API key. Enter one in the API key field, or set ${envName} in the deployment's environment variables.`,
      });
    }

    const system = await buildContext(mode);
    const fullPrompt = [`Mode: ${mode}`, "Return a complete HTML document.", "", prompt].join("\n");
    const generated =
      provider === "anthropic"
        ? await callAnthropic({ baseUrl, apiKey, model, system, prompt: fullPrompt })
        : await callOpenAICompatible({ baseUrl, apiKey, model, system, prompt: fullPrompt });

    res.status(200).json({ html: stripFence(generated), model, provider });
  } catch (error) {
    if (/^401\b/.test(error.message || "")) {
      const envName = envVarNameFor(provider) || "the provider's API key";
      return res.status(401).json({
        error: `Provider rejected the API key (401). Double-check the key for ${provider}, or update ${envName} in the deployment's environment variables.`,
      });
    }
    res.status(500).json({ error: error.message || "Unexpected server error" });
  }
};
