import { type User, type InsertUser, type Message, type InsertMessage, type ChatSession } from "@shared/schema";
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

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private messages: Map<string, Message>;
  private sessions: Map<string, ChatSession>;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.sessions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      isRead: false,
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createSession(userId?: string): Promise<ChatSession> {
    const id = randomUUID();
    const sessionId = randomUUID();
    const session: ChatSession = {
      id,
      userId: userId || null,
      sessionId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(sessionId: string): Promise<ChatSession | undefined> {
    return Array.from(this.sessions.values()).find(
      (session) => session.sessionId === sessionId,
    );
  }

  async updateSessionTimestamp(sessionId: string): Promise<void> {
    const session = Array.from(this.sessions.values()).find(
      (s) => s.sessionId === sessionId,
    );
    if (session) {
      session.updatedAt = new Date();
    }
  }
}

export const storage = new MemStorage();
