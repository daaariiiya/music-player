import { pgTable, serial, varchar, integer, date, text } from 'drizzle-orm/pg-core';
import { performers } from './performers.js';

export const artists = pgTable('artists', {
  artist_id: serial('artist_id').primaryKey(),
  performer_id: integer('performer_id').notNull().unique().references(() => performers.performer_id),
  name: varchar('name', { length: 100 }).notNull(),
  birthday_date: date('birthday_date').notNull(),
  bio: text('bio'),
  career_started_date: date('career_started_date').notNull(),
});

export type Artist = typeof artists.$inferSelect;
export type NewArtist = typeof artists.$inferInsert;
