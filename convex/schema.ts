import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  mockups: defineTable({
    shareId: v.string(),
    title: v.string(),
    clientName: v.optional(v.string()),
    contact: v.optional(v.string()),
    prompt: v.optional(v.string()),
    html: v.string(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_shareId", ["shareId"]),
});
