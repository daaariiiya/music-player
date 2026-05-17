// Pattern: Repository
import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { db } from '../../config/database.js';
import { songs, type Song, type NewSong } from '../../schema/songs.js';
import { performers } from '../../schema/performers.js';
import { artists } from '../../schema/artists.js';
import { music_groups } from '../../schema/music_groups.js';
import { albums } from '../../schema/albums.js';
import { photos } from '../../schema/photos.js';
import { songs_in_playlists } from '../../schema/songs_in_playlists.js';

const songPhotos = alias(photos, 'song_photos');
const albumPhotos = alias(photos, 'album_photos');

export interface SongListRow {
  song_id: number;
  title: string;
  release_date: string;
  duration_seconds: number;
  performer_id: number;
  performer_name: string;
  album_id: number | null;
  album_title: string | null;
  photo_url: string | null;
}

/**
 * Lists songs joined with performer name + album title.
 * `photo_url` resolves to the song's own photo, falling back to the album's photo when missing.
 */
export const listSongs = async (): Promise<SongListRow[]> => {
  const rows = await db
    .select({
      song_id: songs.song_id,
      title: songs.title,
      release_date: songs.release_date,
      duration_seconds: songs.duration_seconds,
      performer_id: songs.performer_id,
      album_id: songs.album_id,
      album_title: albums.title,
      song_photo_url: songPhotos.url,
      album_photo_url: albumPhotos.url,
      artist_name: artists.name,
      group_name: music_groups.name,
    })
    .from(songs)
    .leftJoin(performers, eq(performers.performer_id, songs.performer_id))
    .leftJoin(artists, eq(artists.performer_id, performers.performer_id))
    .leftJoin(music_groups, eq(music_groups.performer_id, performers.performer_id))
    .leftJoin(albums, eq(albums.album_id, songs.album_id))
    .leftJoin(songPhotos, eq(songPhotos.photo_id, songs.photo_id))
    .leftJoin(albumPhotos, eq(albumPhotos.photo_id, albums.photo_id));

  return rows.map((r) => ({
    song_id: r.song_id,
    title: r.title,
    release_date: r.release_date,
    duration_seconds: r.duration_seconds,
    performer_id: r.performer_id,
    performer_name: r.artist_name ?? r.group_name ?? '',
    album_id: r.album_id,
    album_title: r.album_title,
    photo_url: r.song_photo_url ?? r.album_photo_url ?? null,
  }));
};

/**
 * Finds a song with joined performer, album, photo.
 * `photo_url` resolves to the song's own photo, falling back to the album's photo when missing.
 * @param songId - song_id
 */
export const findSongWithDetails = async (songId: number) => {
  const row = await db
    .select({
      song: songs,
      album_title: albums.title,
      song_photo_url: songPhotos.url,
      album_photo_url: albumPhotos.url,
      artist_name: artists.name,
      group_name: music_groups.name,
    })
    .from(songs)
    .leftJoin(performers, eq(performers.performer_id, songs.performer_id))
    .leftJoin(artists, eq(artists.performer_id, performers.performer_id))
    .leftJoin(music_groups, eq(music_groups.performer_id, performers.performer_id))
    .leftJoin(albums, eq(albums.album_id, songs.album_id))
    .leftJoin(songPhotos, eq(songPhotos.photo_id, songs.photo_id))
    .leftJoin(albumPhotos, eq(albumPhotos.photo_id, albums.photo_id))
    .where(eq(songs.song_id, songId))
    .limit(1)
    .then((r) => r[0]);

  if (!row) return null;
  return {
    ...row.song,
    album_title: row.album_title,
    photo_url: row.song_photo_url ?? row.album_photo_url ?? null,
    performer_name: row.artist_name ?? row.group_name ?? '',
  };
};

/**
 * Finds a song base row by id.
 * @param songId - song_id
 */
export const findById = (songId: number): Promise<Song | null> =>
  db.select().from(songs).where(eq(songs.song_id, songId)).limit(1).then((r) => r[0] ?? null);

/**
 * Inserts a new song.
 * @param data - insert payload
 */
export const insertSong = (data: NewSong): Promise<Song> =>
  db.insert(songs).values(data).returning().then((r) => r[0]);

/**
 * Updates a song.
 * @param songId - song_id
 * @param data - partial update
 */
export const updateSong = (songId: number, data: Partial<NewSong>): Promise<void> =>
  Object.keys(data).length === 0
    ? Promise.resolve()
    : db.update(songs).set(data).where(eq(songs.song_id, songId)).then(() => undefined);

/**
 * Deletes a song. Removes playlist references first.
 * @param songId - song_id
 */
export const deleteSong = async (songId: number): Promise<void> => {
  await db.delete(songs_in_playlists).where(eq(songs_in_playlists.song_id, songId));
  await db.delete(songs).where(eq(songs.song_id, songId));
};
