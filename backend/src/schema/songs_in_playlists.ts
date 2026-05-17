import { pgTable, integer, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { songs } from './songs.js';
import { playlists } from './playlists.js';

export const songs_in_playlists = pgTable(
  'songs_in_playlists',
  {
    song_id: integer('song_id').notNull().references(() => songs.song_id),
    playlist_id: integer('playlist_id').notNull().references(() => playlists.playlist_id),
    added_at: timestamp('added_at').defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.song_id, t.playlist_id] }),
  })
);

export type SongInPlaylist = typeof songs_in_playlists.$inferSelect;
export type NewSongInPlaylist = typeof songs_in_playlists.$inferInsert;
