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
