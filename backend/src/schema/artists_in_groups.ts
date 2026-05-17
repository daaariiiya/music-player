import { pgTable, integer, date, primaryKey } from 'drizzle-orm/pg-core';
import { artists } from './artists.js';
import { music_groups } from './music_groups.js';

export const artists_in_groups = pgTable(
  'artists_in_groups',
  {
    artist_id: integer('artist_id').notNull().references(() => artists.artist_id),
    group_id: integer('group_id').notNull().references(() => music_groups.group_id),
    start_date: date('start_date').notNull(),
    end_date: date('end_date'),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.artist_id, t.group_id, t.start_date] }),
  })
);

export type ArtistInGroup = typeof artists_in_groups.$inferSelect;
export type NewArtistInGroup = typeof artists_in_groups.$inferInsert;
