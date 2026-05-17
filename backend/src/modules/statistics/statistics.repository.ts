// Pattern: Repository
import { desc, eq, sql } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { songs } from '../../schema/songs.js';
import { songs_in_playlists } from '../../schema/songs_in_playlists.js';
import { performers } from '../../schema/performers.js';
import { artists } from '../../schema/artists.js';
import { music_groups } from '../../schema/music_groups.js';

/**
 * Top 10 songs by playlist add count.
 */
export const topSongs = async () => {
  const addCount = sql<number>`COUNT(${songs_in_playlists.song_id})`.as('add_count');
  return db
    .select({
      song_id: songs.song_id,
      title: songs.title,
      add_count: addCount,
    })
    .from(songs)
    .leftJoin(songs_in_playlists, eq(songs_in_playlists.song_id, songs.song_id))
    .groupBy(songs.song_id, songs.title)
    .orderBy(desc(addCount))
    .limit(10);
};

/**
 * Genres ranked by playlist presence (song-in-playlist rows per genre).
 */
export const popularGenres = async () => {
  const cnt = sql<number>`COUNT(${songs_in_playlists.song_id})`.as('playlist_count');
  return db
    .select({
      genre: performers.genre,
      playlist_count: cnt,
    })
    .from(performers)
    .innerJoin(songs, eq(songs.performer_id, performers.performer_id))
    .innerJoin(songs_in_playlists, eq(songs_in_playlists.song_id, songs.song_id))
    .groupBy(performers.genre)
    .orderBy(desc(cnt));
};

/**
 * Artist vs group split across playlists (count of song-in-playlist rows).
 */
export const userPreferences = async () => {
  const artistCount = await db
    .select({ c: sql<number>`COUNT(${songs_in_playlists.song_id})` })
    .from(songs_in_playlists)
    .innerJoin(songs, eq(songs.song_id, songs_in_playlists.song_id))
    .innerJoin(artists, eq(artists.performer_id, songs.performer_id))
    .then((r) => Number(r[0]?.c ?? 0));

  const groupCount = await db
    .select({ c: sql<number>`COUNT(${songs_in_playlists.song_id})` })
    .from(songs_in_playlists)
    .innerJoin(songs, eq(songs.song_id, songs_in_playlists.song_id))
    .innerJoin(music_groups, eq(music_groups.performer_id, songs.performer_id))
    .then((r) => Number(r[0]?.c ?? 0));

  const total = artistCount + groupCount;
  return {
    artist: { count: artistCount, share: total ? artistCount / total : 0 },
    group: { count: groupCount, share: total ? groupCount / total : 0 },
    total,
  };
};
