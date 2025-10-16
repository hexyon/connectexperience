import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const storyChapters = pgTable("story_chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  imageUrl: text("image_url").notNull(),
  narrative: text("narrative").notNull(),
  connections: jsonb("connections").$type<string[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  chapterNumber: integer("chapter_number").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStoryChapterSchema = createInsertSchema(storyChapters).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type StoryChapter = typeof storyChapters.$inferSelect;
export type InsertStoryChapter = z.infer<typeof insertStoryChapterSchema>;
