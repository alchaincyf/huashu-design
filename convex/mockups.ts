import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

export const create = internalMutation({
  args: {
    shareId: v.string(),
    title: v.string(),
    clientName: v.optional(v.string()),
    contact: v.optional(v.string()),
    prompt: v.optional(v.string()),
    html: v.string(),
    status: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mockups")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();

    const doc = {
      shareId: args.shareId,
      title: args.title,
      clientName: args.clientName,
      contact: args.contact,
      prompt: args.prompt,
      html: args.html,
      status: args.status,
      updatedAt: args.now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return { ...existing, ...doc };
    }

    const id = await ctx.db.insert("mockups", { ...doc, createdAt: args.now });
    return await ctx.db.get(id);
  },
});

export const get = internalQuery({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mockups")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();
  },
});

export const list = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 100, 1), 500);
    const rows = await ctx.db.query("mockups").order("desc").take(limit);
    return rows.map(({ html, ...rest }) => ({
      ...rest,
      htmlSize: html.length,
    }));
  },
});

export const update = internalMutation({
  args: {
    shareId: v.string(),
    title: v.optional(v.string()),
    clientName: v.optional(v.string()),
    contact: v.optional(v.string()),
    status: v.optional(v.string()),
    html: v.optional(v.string()),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mockups")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();
    if (!existing) return null;

    const patch: Record<string, unknown> = { updatedAt: args.now };
    if (args.title !== undefined) patch.title = args.title;
    if (args.clientName !== undefined) patch.clientName = args.clientName;
    if (args.contact !== undefined) patch.contact = args.contact;
    if (args.status !== undefined) patch.status = args.status;
    if (args.html !== undefined) patch.html = args.html;

    await ctx.db.patch(existing._id, patch);
    return await ctx.db.get(existing._id);
  },
});

export const remove = internalMutation({
  args: { shareId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("mockups")
      .withIndex("by_shareId", (q) => q.eq("shareId", args.shareId))
      .unique();
    if (!existing) return { removed: false };
    await ctx.db.delete(existing._id);
    return { removed: true };
  },
});
