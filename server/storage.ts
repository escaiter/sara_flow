import { type User, type InsertUser, type Message, type InsertMessage, type ChatSession, users, messages, chatSessions } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySession(sessionId: string): Promise<Message[]>;
  
  // Session operations
  createSession(userId?: string): Promise<ChatSession>;
  getSession(sessionId: string): Promise<ChatSession | undefined>;
  updateSessionTimestamp(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values({
        ...insertMessage,
        timestamp: new Date(),
        isRead: false,
      })
      .returning();
    return message;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.timestamp);
  }

  async createSession(userId?: string): Promise<ChatSession> {
    const [session] = await db
      .insert(chatSessions)
      .values({
        userId: userId || null,
        sessionId: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return session;
  }

  async getSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.sessionId, sessionId));
    return session || undefined;
  }

  async updateSessionTimestamp(sessionId: string): Promise<void> {
    await db
      .update(chatSessions)
      .set({ updatedAt: new Date() })
      .where(eq(chatSessions.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();
