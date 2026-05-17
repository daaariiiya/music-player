import { pgTable, serial, varchar, integer, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const playlists = pgTable('playlists', {
  playlist_id: serial('playlist_id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => users.user_id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
});

export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
