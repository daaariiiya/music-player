import { pgTable, serial, varchar, integer, date, text, timestamp } from 'drizzle-orm/pg-core';
import { albums } from './albums.js';
import { performers } from './performers.js';
import { photos } from './photos.js';

export const songs = pgTable('songs', {
  song_id: serial('song_id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  release_date: date('release_date').notNull(),
  duration_seconds: integer('duration_seconds').notNull(),
  album_id: integer('album_id').references(() => albums.album_id),
  performer_id: integer('performer_id').notNull().references(() => performers.performer_id),
  photo_id: integer('photo_id').references(() => photos.photo_id),
  created_at: timestamp('created_at').defaultNow(),
});

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
