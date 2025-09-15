import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: text("session_id").notNull(),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'bot'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  isRead: boolean("is_read").default(false),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(chatSessions),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [messages.sessionId],
    references: [chatSessions.sessionId],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  content: true,
  sender: true,
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type ChatMessageRequest = z.infer<typeof chatMessageSchema>;
export type InsertChatSession = typeof chatSessions.$inferInsert;
