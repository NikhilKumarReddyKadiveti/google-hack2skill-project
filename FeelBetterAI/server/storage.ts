import {
  users,
  conversations,
  messages,
  moodEntries,
  userSessions,
  crisisEvents,
  type User,
  type UpsertUser,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type MoodEntry,
  type InsertMoodEntry,
  type UserSession,
  type InsertUserSession,
  type CrisisEvent,
  type InsertCrisisEvent,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;
  updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message>;
  
  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string, startDate?: Date, endDate?: Date): Promise<MoodEntry[]>;
  getUserAverageMood(userId: string, days?: number): Promise<number>;
  
  // Session operations
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(id: string, updates: Partial<InsertUserSession>): Promise<UserSession>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  
  // Crisis operations
  createCrisisEvent(event: InsertCrisisEvent): Promise<CrisisEvent>;
  getUserCrisisEvents(userId: string): Promise<CrisisEvent[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db
      .insert(conversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    const [updatedConversation] = await db
      .update(conversations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning();
    return updatedConversation;
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.timestamp);
  }

  async updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set(updates)
      .where(eq(messages.id, id))
      .returning();
    return updatedMessage;
  }

  // Mood operations
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const [newEntry] = await db
      .insert(moodEntries)
      .values(entry)
      .returning();
    return newEntry;
  }

  async getUserMoodEntries(userId: string, startDate?: Date, endDate?: Date): Promise<MoodEntry[]> {
    let query = db.select().from(moodEntries).where(eq(moodEntries.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(
        and(
          gte(moodEntries.date, startDate),
          lte(moodEntries.date, endDate)
        )
      );
    }
    
    return await query.orderBy(desc(moodEntries.date));
  }

  async getUserAverageMood(userId: string, days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await db
      .select({ avg: sql<number>`avg(${moodEntries.score})` })
      .from(moodEntries)
      .where(
        and(
          eq(moodEntries.userId, userId),
          gte(moodEntries.date, startDate)
        )
      );

    return result[0]?.avg || 5; // Default to neutral mood
  }

  // Session operations
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [newSession] = await db
      .insert(userSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async updateUserSession(id: string, updates: Partial<InsertUserSession>): Promise<UserSession> {
    const [updatedSession] = await db
      .update(userSessions)
      .set(updates)
      .where(eq(userSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.startTime));
  }

  // Crisis operations
  async createCrisisEvent(event: InsertCrisisEvent): Promise<CrisisEvent> {
    const [newEvent] = await db
      .insert(crisisEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getUserCrisisEvents(userId: string): Promise<CrisisEvent[]> {
    return await db
      .select()
      .from(crisisEvents)
      .where(eq(crisisEvents.userId, userId))
      .orderBy(desc(crisisEvents.timestamp));
  }
}

export const storage = new DatabaseStorage();
