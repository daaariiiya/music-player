import { NotFoundError } from '../../utils/errors.js';
import * as repo from './albums.repository.js';
import * as songsRepo from '../songs/songs.repository.js';
import { resolvePhotoId } from '../../services/photo.service.js';
import type { BulkAlbumSongInput, BulkCreateAlbumInput, CreateAlbumInput, UpdateAlbumInput } from './albums.schema.js';

/**
 * Lists all albums (with performer name).
 */
export const listAll = () => repo.listAlbums();

/**
 * Returns one album with its songs.
 * @param id - album_id
 * @throws NotFoundError if missing
 */
export const getById = async (id: number) => {
  const album = await repo.findAlbumWithSongs(id);
  if (!album) throw new NotFoundError('Album not found.');
  return album;
};

/**
 * Creates a new album.
 * @param input - validated create payload
 */
export const create = async (input: CreateAlbumInput) => {
  const photo_id = (await resolvePhotoId(input.photoId, input.photoUrl)) ?? null;
  const created = await repo.insertAlbum({
    title: input.title,
    description: input.description ?? null,
    release_date: input.release_date,
    performer_id: input.performer_id,
    photo_id,
  });
  return { albumId: created.album_id };
};

export interface BulkSongResultRow {
  index: number;
  ok: boolean;
  songId?: number;
  error?: string;
}

export interface BulkAlbumResultRow {
  index: number;
  ok: boolean;
  albumId?: number;
  songResults?: BulkSongResultRow[];
  error?: string;
}

const createSongForAlbum = async (
  song: BulkAlbumSongInput,
  albumId: number,
  performerId: number
): Promise<number> => {
  const photo_id = (await resolvePhotoId(song.photoId, song.photoUrl)) ?? null;
  const inserted = await songsRepo.insertSong({
    title: song.title,
    description: song.description ?? null,
    release_date: song.release_date,
    duration_seconds: song.duration_seconds,
    album_id: albumId,
    performer_id: performerId,
    photo_id,
  });
  return inserted.song_id;
};

/**
 * Bulk creates albums; for each album, also inserts its nested songs.
 * Album-level failures skip song inserts. Song-level failures recorded per row.
 * @param items - validated payloads
 */
export const bulkCreate = async (items: BulkCreateAlbumInput[]): Promise<BulkAlbumResultRow[]> => {
  const results: BulkAlbumResultRow[] = [];
  for (let i = 0; i < items.length; i++) {
    const { album, songs } = items[i];
    try {
      const { albumId } = await create(album as CreateAlbumInput);
      const songResults: BulkSongResultRow[] = [];
      for (let s = 0; s < (songs?.length ?? 0); s++) {
        try {
          const songId = await createSongForAlbum(
            songs![s] as BulkAlbumSongInput,
            albumId,
            album.performer_id
          );
          songResults.push({ index: s, ok: true, songId });
        } catch (err) {
          songResults.push({
            index: s,
            ok: false,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }
      results.push({ index: i, ok: true, albumId, songResults });
    } catch (err) {
      results.push({
        index: i,
        ok: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }
  return results;
};

/**
 * Updates an album.
 * @param id - album_id
 * @param input - partial update
 * @throws NotFoundError if missing
 */
export const update = async (id: number, input: UpdateAlbumInput) => {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Album not found.');

  await repo.updateAlbum(id, {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.release_date !== undefined && { release_date: input.release_date }),
    ...(input.performer_id !== undefined && { performer_id: input.performer_id }),
    ...(input.photoId !== undefined && { photo_id: input.photoId }),
  });
};

/**
 * Deletes an album.
 * @param id - album_id
 * @throws NotFoundError if missing
 */
export const remove = async (id: number) => {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Album not found.');
  await repo.deleteAlbum(id);
};
