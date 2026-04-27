const crypto = require("node:crypto");

function getConvexHttpUrl() {
  const explicit = process.env.CONVEX_HTTP_URL || process.env.CONVEX_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const convexUrl = process.env.VITE_CONVEX_URL || process.env.CONVEX_URL;
  if (!convexUrl) return "";
  return convexUrl.replace(/\/$/, "").replace(".convex.cloud", ".convex.site");
}

function getOrigin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function newShareId(title = "mockup") {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 36) || "mockup";
  return `${slug}-${crypto.randomBytes(4).toString("hex")}`;
}

async function convexRequest(path, init) {
  const baseUrl = getConvexHttpUrl();
  if (!baseUrl) {
    const error = new Error("Convex is not configured. Set CONVEX_HTTP_URL in Vercel to your Convex .convex.site URL.");
    error.status = 503;
    throw error;
  }

  const response = await fetch(`${baseUrl}${path}`, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Convex request failed with ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const url = new URL(req.url, "http://localhost");
      const id = url.searchParams.get("id");
      if (!id) return res.status(400).json({ error: "id is required." });
      const data = await convexRequest(`/mockups?id=${encodeURIComponent(id)}`, { method: "GET" });
      return res.status(200).json(data);
    }

    if (req.method === "POST") {
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

      return res.status(200).json({
        ...data,
        shareId,
        shareUrl: `${getOrigin(req)}/mockup/${shareId}`,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "Unexpected server error" });
  }
};
