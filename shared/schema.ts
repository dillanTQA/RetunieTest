export * from "./models/auth";
export * from "./models/chat";

import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// === Triage Requests ===
export const triageRequests = pgTable("triage_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  status: text("status").notNull().default("draft"), // draft, completed
  title: text("title").notNull().default("New Requirement"),
  conversationId: integer("conversation_id"), // Link to chat conversation
  answers: jsonb("answers").$type<Record<string, any>>().default({}),
  recommendation: jsonb("recommendation").$type<any>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === Specifications ===
export const specifications = pgTable("specifications", {
  id: serial("id").primaryKey(),
  triageRequestId: integer("triage_request_id").references(() => triageRequests.id),
  content: text("content").notNull(),
  version: integer("version").default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// === Suppliers ===
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'agency', 'sow', 'independent'
  rating: integer("rating").default(5),
  description: text("description"),
  logoUrl: text("logo_url"),
  isPreferred: boolean("is_preferred").default(true),
});

// === RELATIONS ===
export const triageRelations = relations(triageRequests, ({ one, many }) => ({
  user: one(users, {
    fields: [triageRequests.userId],
    references: [users.id],
  }),
  specification: one(specifications, {
    fields: [triageRequests.id],
    references: [specifications.triageRequestId],
  }),
}));

export const specRelations = relations(specifications, ({ one }) => ({
  triageRequest: one(triageRequests, {
    fields: [specifications.triageRequestId],
    references: [triageRequests.id],
  }),
}));

// === SCHEMAS ===
export const insertTriageSchema = createInsertSchema(triageRequests).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertSpecSchema = createInsertSchema(specifications).omit({ 
  id: true, 
  createdAt: true 
});

// === TYPES ===
export type TriageRequest = typeof triageRequests.$inferSelect;
export type InsertTriageRequest = z.infer<typeof insertTriageSchema>;

export type Specification = typeof specifications.$inferSelect;
export type InsertSpecification = z.infer<typeof insertSpecSchema>;

export type Supplier = typeof suppliers.$inferSelect;

export type Recommendation = {
  routes: Array<{
    type: 'independent' | 'sow' | 'agency';
    title: string;
    description: string;
    pros: string[];
    cons: string[];
    matchScore: number; // 0-100
  }>;
  summary: string;
};
