import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { photos } from './photos.js';

export const performers = pgTable('performers', {
  performer_id: serial('performer_id').primaryKey(),
  type: varchar('type', { length: 10 }).notNull(),
  genre: varchar('genre', { length: 100 }).notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  photo_id: integer('photo_id').references(() => photos.photo_id),
  created_at: timestamp('created_at').defaultNow(),
});

export type Performer = typeof performers.$inferSelect;
export type NewPerformer = typeof performers.$inferInsert;
