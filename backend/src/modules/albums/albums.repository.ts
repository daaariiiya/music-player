// Pattern: Repository
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { albums, type Album, type NewAlbum } from '../../schema/albums.js';
import { performers } from '../../schema/performers.js';
import { artists } from '../../schema/artists.js';
import { music_groups } from '../../schema/music_groups.js';
import { songs } from '../../schema/songs.js';
import { photos } from '../../schema/photos.js';

export interface AlbumListRow {
  album_id: number;
  title: string;
  release_date: string;
  performer_id: number;
  performer_name: string;
  photo_url: string | null;
}

/**
 * Lists albums joined with performer display name + photo URL.
 */
export const listAlbums = async (): Promise<AlbumListRow[]> => {
  const rows = await db
    .select({
      album_id: albums.album_id,
      title: albums.title,
      release_date: albums.release_date,
      performer_id: albums.performer_id,
      photo_url: photos.url,
      artist_name: artists.name,
      group_name: music_groups.name,
    })
    .from(albums)
    .leftJoin(performers, eq(performers.performer_id, albums.performer_id))
    .leftJoin(artists, eq(artists.performer_id, performers.performer_id))
    .leftJoin(music_groups, eq(music_groups.performer_id, performers.performer_id))
    .leftJoin(photos, eq(photos.photo_id, albums.photo_id));

  return rows.map((r) => ({
    album_id: r.album_id,
    title: r.title,
    release_date: r.release_date,
    performer_id: r.performer_id,
    performer_name: r.artist_name ?? r.group_name ?? '',
    photo_url: r.photo_url,
  }));
};

/**
 * Finds an album with its songs.
 * @param albumId - album_id
 */
export const findAlbumWithSongs = async (albumId: number) => {
  const album = await db
    .select({
      album: albums,
      photo_url: photos.url,
      artist_name: artists.name,
      group_name: music_groups.name,
    })
    .from(albums)
    .leftJoin(performers, eq(performers.performer_id, albums.performer_id))
    .leftJoin(artists, eq(artists.performer_id, performers.performer_id))
    .leftJoin(music_groups, eq(music_groups.performer_id, performers.performer_id))
    .leftJoin(photos, eq(photos.photo_id, albums.photo_id))
    .where(eq(albums.album_id, albumId))
    .limit(1)
    .then((r) => r[0]);

  if (!album) return null;

  const songList = await db
    .select({
      song_id: songs.song_id,
      title: songs.title,
      duration_seconds: songs.duration_seconds,
      release_date: songs.release_date,
    })
    .from(songs)
    .where(eq(songs.album_id, albumId));

  return {
    ...album.album,
    photo_url: album.photo_url,
    performer_name: album.artist_name ?? album.group_name ?? '',
    songs: songList,
  };
};

/**
 * Finds an album by id (base row only).
 * @param albumId - album_id
 */
export const findById = (albumId: number): Promise<Album | null> =>
  db.select().from(albums).where(eq(albums.album_id, albumId)).limit(1).then((r) => r[0] ?? null);

/**
 * Inserts a new album.
 * @param data - insert payload
 */
export const insertAlbum = (data: NewAlbum): Promise<Album> =>
  db.insert(albums).values(data).returning().then((r) => r[0]);

/**
 * Updates an album.
 * @param albumId - album_id
 * @param data - partial update
 */
export const updateAlbum = (albumId: number, data: Partial<NewAlbum>): Promise<void> =>
  Object.keys(data).length === 0
    ? Promise.resolve()
    : db.update(albums).set(data).where(eq(albums.album_id, albumId)).then(() => undefined);

/**
 * Deletes an album. Detaches songs first (sets album_id to null).
 * @param albumId - album_id
 */
export const deleteAlbum = async (albumId: number): Promise<void> => {
  await db.update(songs).set({ album_id: null }).where(eq(songs.album_id, albumId));
  await db.delete(albums).where(eq(albums.album_id, albumId));
};
