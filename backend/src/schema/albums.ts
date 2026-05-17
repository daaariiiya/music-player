import { pgTable, serial, varchar, integer, date, text, timestamp } from 'drizzle-orm/pg-core';
import { performers } from './performers.js';
import { photos } from './photos.js';

export const albums = pgTable('albums', {
  album_id: serial('album_id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  release_date: date('release_date').notNull(),
  performer_id: integer('performer_id').notNull().references(() => performers.performer_id),
  photo_id: integer('photo_id').references(() => photos.photo_id),
  created_at: timestamp('created_at').defaultNow(),
});

export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
