// Pattern: Repository
import { and, eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { playlists, type Playlist, type NewPlaylist } from '../../schema/playlists.js';
import { songs_in_playlists } from '../../schema/songs_in_playlists.js';
import { songs } from '../../schema/songs.js';

/**
 * Lists playlists owned by the given user.
 * @param userId - user_id
 */
export const listByUser = (userId: number): Promise<Playlist[]> =>
  db.select().from(playlists).where(eq(playlists.user_id, userId));

/**
 * Finds a playlist by id.
 * @param playlistId - playlist_id
 */
export const findById = (playlistId: number): Promise<Playlist | null> =>
  db.select().from(playlists).where(eq(playlists.playlist_id, playlistId)).limit(1).then((r) => r[0] ?? null);

/**
 * Loads a playlist plus its songs ordered by added_at.
 * @param playlistId - playlist_id
 */
export const findWithSongs = async (playlistId: number) => {
  const playlist = await findById(playlistId);
  if (!playlist) return null;

  const items = await db
    .select({
      song_id: songs.song_id,
      title: songs.title,
      duration_seconds: songs.duration_seconds,
      release_date: songs.release_date,
      added_at: songs_in_playlists.added_at,
    })
    .from(songs_in_playlists)
    .innerJoin(songs, eq(songs.song_id, songs_in_playlists.song_id))
    .where(eq(songs_in_playlists.playlist_id, playlistId));

  return { ...playlist, songs: items };
};

/**
 * Inserts a new playlist.
 * @param data - insert payload
 */
export const insertPlaylist = (data: NewPlaylist): Promise<Playlist> =>
  db.insert(playlists).values(data).returning().then((r) => r[0]);

/**
 * Deletes a playlist and its song associations.
 * @param playlistId - playlist_id
 */
export const deletePlaylist = async (playlistId: number): Promise<void> => {
  await db.delete(songs_in_playlists).where(eq(songs_in_playlists.playlist_id, playlistId));
  await db.delete(playlists).where(eq(playlists.playlist_id, playlistId));
};

/**
 * Adds a song to a playlist. Idempotent (no error if already present).
 * @param playlistId - playlist_id
 * @param songId - song_id
 */
export const addSong = (playlistId: number, songId: number): Promise<void> =>
  db
    .insert(songs_in_playlists)
    .values({ playlist_id: playlistId, song_id: songId })
    .onConflictDoNothing()
    .then(() => undefined);

/**
 * Removes a song from a playlist.
 * @param playlistId - playlist_id
 * @param songId - song_id
 */
export const removeSong = (playlistId: number, songId: number): Promise<void> =>
  db
    .delete(songs_in_playlists)
    .where(
      and(
        eq(songs_in_playlists.playlist_id, playlistId),
        eq(songs_in_playlists.song_id, songId)
      )
    )
    .then(() => undefined);
