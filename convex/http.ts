import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
      ...init.headers,
    },
  });
}

http.route({
  path: "/mockups",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
  path: "/mockups",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body?.shareId || !body?.title || !body?.html) {
      return json({ error: "shareId, title, and html are required." }, { status: 400 });
    }

    const now = Date.now();
    const mockup = await ctx.runMutation(internal.mockups.create, {
      shareId: String(body.shareId),
      title: String(body.title),
      clientName: body.clientName ? String(body.clientName) : undefined,
      contact: body.contact ? String(body.contact) : undefined,
      prompt: body.prompt ? String(body.prompt) : undefined,
      html: String(body.html),
      status: body.status ? String(body.status) : "draft",
      now,
    });

    return json({ mockup });
  }),
});

http.route({
  path: "/mockups",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("id");
    if (!shareId) return json({ error: "id is required." }, { status: 400 });

    const mockup = await ctx.runQuery(internal.mockups.get, { shareId });
    if (!mockup) return json({ error: "Mockup not found." }, { status: 404 });

    return json({ mockup });
  }),
});

export default http;
