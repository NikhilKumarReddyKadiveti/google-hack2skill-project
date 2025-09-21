import { db } from "./db/postgres";

// Define types for PostgreSQL rows (simplified)
type User = any;
type UpsertUser = any;
type Conversation = any;
type InsertConversation = any;
type Message = any;
type InsertMessage = any;
type MoodEntry = any;
type InsertMoodEntry = any;
type UserSession = any;
type InsertUserSession = any;
type CrisisEvent = any;
type InsertCrisisEvent = any;

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
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Upsert logic for PostgreSQL
    const keys = Object.keys(userData);
    const values = Object.values(userData);
    const sql = `INSERT INTO users (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT (id) DO UPDATE SET ${keys.map((key, i) => `${key} = EXCLUDED.${key}`).join(', ')}`;
    await db.query(sql, values);
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userData.id]);
    return result.rows[0];
  }

  // Conversation operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const keys = Object.keys(conversation);
    const values = Object.values(conversation);
    const sql = `INSERT INTO conversations (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const result = await db.query(sql, values);
    return result.rows[0];
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const result = await db.query('SELECT * FROM conversations WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const result = await db.query('SELECT * FROM conversations WHERE userId = $1 ORDER BY createdAt DESC', [userId]);
    return result.rows;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sql = `UPDATE conversations SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')}, updatedAt = $${keys.length + 1} WHERE id = $${keys.length + 2} RETURNING *`;
    const result = await db.query(sql, [...values, new Date(), id]);
    return result.rows[0];
  }

  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const keys = Object.keys(message);
    const values = Object.values(message);
    const sql = `INSERT INTO messages (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const result = await db.query(sql, values);
    return result.rows[0];
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const result = await db.query('SELECT * FROM messages WHERE conversationId = $1 ORDER BY timestamp', [conversationId]);
    return result.rows;
  }

  async updateMessage(id: string, updates: Partial<InsertMessage>): Promise<Message> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sql = `UPDATE messages SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await db.query(sql, [...values, id]);
    return result.rows[0];
  }

  // Mood operations
  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const keys = Object.keys(entry);
    const values = Object.values(entry);
    const sql = `INSERT INTO moodEntries (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const result = await db.query(sql, values);
    return result.rows[0];
  }

  async getUserMoodEntries(userId: string, startDate?: Date, endDate?: Date): Promise<MoodEntry[]> {
    let sql = 'SELECT * FROM moodEntries WHERE userId = $1';
    const params: any[] = [userId];
    if (startDate && endDate) {
      sql += ' AND date >= $2 AND date <= $3';
      params.push(startDate, endDate);
    }
    sql += ' ORDER BY date DESC';
    const result = await db.query(sql, params);
    return result.rows;
  }

  async getUserAverageMood(userId: string, days: number = 7): Promise<number> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const result = await db.query('SELECT AVG(score) as avg FROM moodEntries WHERE userId = $1 AND date >= $2', [userId, startDate]);
    return result.rows[0]?.avg || 5;
  }

  // Session operations
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const keys = Object.keys(session);
    const values = Object.values(session);
    const sql = `INSERT INTO userSessions (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const result = await db.query(sql, values);
    return result.rows[0];
  }

  async updateUserSession(id: string, updates: Partial<InsertUserSession>): Promise<UserSession> {
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sql = `UPDATE userSessions SET ${keys.map((key, i) => `${key} = $${i + 1}`).join(', ')} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await db.query(sql, [...values, id]);
    return result.rows[0];
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    const result = await db.query('SELECT * FROM userSessions WHERE userId = $1 ORDER BY startTime DESC', [userId]);
    return result.rows;
  }

  // Crisis operations
  async createCrisisEvent(event: InsertCrisisEvent): Promise<CrisisEvent> {
    const keys = Object.keys(event);
    const values = Object.values(event);
    const sql = `INSERT INTO crisisEvents (${keys.join(',')}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`;
    const result = await db.query(sql, values);
    return result.rows[0];
  }

  async getUserCrisisEvents(userId: string): Promise<CrisisEvent[]> {
    const result = await db.query('SELECT * FROM crisisEvents WHERE userId = $1 ORDER BY timestamp DESC', [userId]);
    return result.rows;
  }
}

export const storage = new DatabaseStorage();
