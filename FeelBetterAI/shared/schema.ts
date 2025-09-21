// MySQL-compatible TypeScript interfaces

export interface Session {
  session_id: string;
  expires: Date;
  data: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title?: string;
  mode: 'talk' | 'survey';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  moodScore?: number;
  crisisFlag?: boolean;
}

export interface MoodEntry {
  id: string;
  userId: string;
  conversationId?: string;
  score: number;
  confidence: number;
  date: Date;
}
export interface MoodEntry {
  id: string;
  userId: string;
  conversationId?: string;
  score: number;
  confidence: number;
  date: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
}
export interface UserSession {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
}

export interface CrisisEvent {
  id: string;
  userId: string;
  messageId?: string;
  severity: 'low' | 'medium' | 'high';
  triggerWords?: string;
  actionTaken?: string;
  timestamp: Date;
}
export interface CrisisEvent {
  id: string;
  userId: string;
  messageId?: string;
  severity: 'low' | 'medium' | 'high';
  triggerWords?: string;
  actionTaken?: string;
  timestamp: Date;
}

// Relations removed as per patch requirement


// Types

