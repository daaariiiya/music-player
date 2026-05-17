import { pgTable, serial, varchar, integer, text } from 'drizzle-orm/pg-core';
import { performers } from './performers.js';

export const music_groups = pgTable('music_groups', {
  group_id: serial('group_id').primaryKey(),
  performer_id: integer('performer_id').notNull().unique().references(() => performers.performer_id),
  name: varchar('name', { length: 100 }).notNull(),
  year_created: integer('year_created').notNull(),
  bio: text('bio'),
});

export type MusicGroup = typeof music_groups.$inferSelect;
export type NewMusicGroup = typeof music_groups.$inferInsert;
