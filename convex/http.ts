import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
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

    if (shareId) {
      const mockup = await ctx.runQuery(internal.mockups.get, { shareId });
      if (!mockup) return json({ error: "Mockup not found." }, { status: 404 });
      return json({ mockup });
    }

    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
    const mockups = await ctx.runQuery(internal.mockups.list, {
      limit: Number.isFinite(limit) ? limit : undefined,
    });
    return json({ mockups });
  }),
});

http.route({
  path: "/mockups",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    if (!body?.shareId) {
      return json({ error: "shareId is required." }, { status: 400 });
    }
    const updated = await ctx.runMutation(internal.mockups.update, {
      shareId: String(body.shareId),
      title: body.title !== undefined ? String(body.title) : undefined,
      clientName: body.clientName !== undefined ? String(body.clientName) : undefined,
      contact: body.contact !== undefined ? String(body.contact) : undefined,
      status: body.status !== undefined ? String(body.status) : undefined,
      html: body.html !== undefined ? String(body.html) : undefined,
      now: Date.now(),
    });
    if (!updated) return json({ error: "Mockup not found." }, { status: 404 });
    return json({ mockup: updated });
  }),
});

http.route({
  path: "/mockups",
  method: "DELETE",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("id");
    if (!shareId) return json({ error: "id is required." }, { status: 400 });
    const result = await ctx.runMutation(internal.mockups.remove, { shareId });
    return json(result);
  }),
});

export default http;
