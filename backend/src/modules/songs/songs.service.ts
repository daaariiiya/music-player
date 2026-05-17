import { NotFoundError } from '../../utils/errors.js';
import * as repo from './songs.repository.js';
import { resolvePhotoId } from '../../services/photo.service.js';
import type { CreateSongInput, UpdateSongInput } from './songs.schema.js';

/**
 * Lists all songs (with performer + album info).
 */
export const listAll = () => repo.listSongs();

/**
 * Returns a song with full details.
 * @param id - song_id
 * @throws NotFoundError if missing
 */
export const getById = async (id: number) => {
  const song = await repo.findSongWithDetails(id);
  if (!song) throw new NotFoundError('Song not found.');
  return song;
};

/**
 * Creates a new song.
 * @param input - validated create payload
 */
export const create = async (input: CreateSongInput) => {
  const photo_id = (await resolvePhotoId(input.photoId, input.photoUrl)) ?? null;
  const created = await repo.insertSong({
    title: input.title,
    description: input.description ?? null,
    release_date: input.release_date,
    duration_seconds: input.duration_seconds,
    performer_id: input.performer_id,
    album_id: input.album_id ?? null,
    photo_id,
  });
  return { songId: created.song_id };
};

export interface BulkSongResultRow {
  index: number;
  ok: boolean;
  songId?: number;
  error?: string;
}

/**
 * Bulk creates songs. Per-item independent.
 * @param items - validated create payloads
 */
export const bulkCreate = async (items: CreateSongInput[]): Promise<BulkSongResultRow[]> => {
  const results: BulkSongResultRow[] = [];
  for (let i = 0; i < items.length; i++) {
    try {
      const { songId } = await create(items[i]);
      results.push({ index: i, ok: true, songId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      results.push({ index: i, ok: false, error: message });
    }
  }
  return results;
};

/**
 * Updates a song.
 * @param id - song_id
 * @param input - partial update
 * @throws NotFoundError if missing
 */
export const update = async (id: number, input: UpdateSongInput) => {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Song not found.');

  await repo.updateSong(id, {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.description !== undefined && { description: input.description }),
    ...(input.release_date !== undefined && { release_date: input.release_date }),
    ...(input.duration_seconds !== undefined && { duration_seconds: input.duration_seconds }),
    ...(input.performer_id !== undefined && { performer_id: input.performer_id }),
    ...(input.album_id !== undefined && { album_id: input.album_id }),
    ...(input.photoId !== undefined && { photo_id: input.photoId }),
  });
};

/**
 * Deletes a song.
 * @param id - song_id
 * @throws NotFoundError if missing
 */
export const remove = async (id: number) => {
  const existing = await repo.findById(id);
  if (!existing) throw new NotFoundError('Song not found.');
  await repo.deleteSong(id);
};
