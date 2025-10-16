import { type StoryChapter, type InsertStoryChapter } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createChapter(chapter: InsertStoryChapter, sessionId: string): Promise<StoryChapter>;
  getAllChapters(sessionId: string): Promise<StoryChapter[]>;
  getChapterById(id: string, sessionId: string): Promise<StoryChapter | undefined>;
  deleteAllChapters(sessionId: string): Promise<void>;
  cleanupExpiredSessions?: () => void;
}

export class SessionStorage implements IStorage {
  private sessions: Map<string, Map<string, StoryChapter>>;
  private sessionTimestamps: Map<string, number>;
  private readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    this.sessions = new Map();
    this.sessionTimestamps = new Map();
    
    // Clean up expired sessions every hour
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, 60 * 60 * 1000);
  }

  private getOrCreateSession(sessionId: string): Map<string, StoryChapter> {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, new Map());
    }
    // Update session timestamp
    this.sessionTimestamps.set(sessionId, Date.now());
    return this.sessions.get(sessionId)!;
  }

  async createChapter(insertChapter: InsertStoryChapter, sessionId: string): Promise<StoryChapter> {
    const sessionChapters = this.getOrCreateSession(sessionId);
    const id = randomUUID();
    const chapter: StoryChapter = {
      id,
      userId: insertChapter.userId || null,
      imageUrl: insertChapter.imageUrl,
      narrative: insertChapter.narrative,
      connections: (insertChapter.connections as string[]) || [],
      tags: (insertChapter.tags as string[]) || [],
      chapterNumber: insertChapter.chapterNumber,
      createdAt: new Date()
    };
    sessionChapters.set(id, chapter);
    return chapter;
  }

  async getAllChapters(sessionId: string): Promise<StoryChapter[]> {
    const sessionChapters = this.getOrCreateSession(sessionId);
    return Array.from(sessionChapters.values()).sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async getChapterById(id: string, sessionId: string): Promise<StoryChapter | undefined> {
    const sessionChapters = this.getOrCreateSession(sessionId);
    return sessionChapters.get(id);
  }

  async deleteAllChapters(sessionId: string): Promise<void> {
    const sessionChapters = this.getOrCreateSession(sessionId);
    sessionChapters.clear();
  }

  cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    for (const [sessionId, timestamp] of this.sessionTimestamps.entries()) {
      if (now - timestamp > this.SESSION_TIMEOUT) {
        expiredSessions.push(sessionId);
      }
    }

    for (const sessionId of expiredSessions) {
      this.sessions.delete(sessionId);
      this.sessionTimestamps.delete(sessionId);
      console.log(`Cleaned up expired session: ${sessionId}`);
    }

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }
}

export const storage = new SessionStorage();
