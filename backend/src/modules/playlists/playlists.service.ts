import { ForbiddenError, NotFoundError } from '../../utils/errors.js';
import * as repo from './playlists.repository.js';
import * as songsRepo from '../songs/songs.repository.js';
import type { CreatePlaylistInput } from './playlists.schema.js';

/**
 * Lists playlists owned by the user.
 * @param userId - authenticated user_id
 */
export const listMine = (userId: number) => repo.listByUser(userId);

/**
 * Returns a playlist + songs. Owner-only.
 * @param playlistId - playlist_id
 * @param userId - authenticated user_id
 * @throws NotFoundError / ForbiddenError
 */
export const getOwned = async (playlistId: number, userId: number) => {
  const pl = await repo.findById(playlistId);
  if (!pl) throw new NotFoundError('Playlist not found.');
  if (pl.user_id !== userId) throw new ForbiddenError('Not your playlist.');
  return repo.findWithSongs(playlistId);
};

/**
 * Creates a playlist owned by the user.
 * @param userId - owner user_id
 * @param input - validated create payload
 */
export const create = async (userId: number, input: CreatePlaylistInput) => {
  const created = await repo.insertPlaylist({
    user_id: userId,
    title: input.title,
    description: input.description ?? null,
  });
  return { playlistId: created.playlist_id };
};

/**
 * Deletes the playlist. Owner-only.
 * @param playlistId - playlist_id
 * @param userId - authenticated user_id
 */
export const remove = async (playlistId: number, userId: number) => {
  const pl = await repo.findById(playlistId);
  if (!pl) throw new NotFoundError('Playlist not found.');
  if (pl.user_id !== userId) throw new ForbiddenError('Not your playlist.');
  await repo.deletePlaylist(playlistId);
};

/**
 * Adds a song to a playlist. Owner-only.
 * @param playlistId - playlist_id
 * @param userId - authenticated user_id
 * @param songId - song to add
 */
export const addSong = async (playlistId: number, userId: number, songId: number) => {
  const pl = await repo.findById(playlistId);
  if (!pl) throw new NotFoundError('Playlist not found.');
  if (pl.user_id !== userId) throw new ForbiddenError('Not your playlist.');
  const song = await songsRepo.findById(songId);
  if (!song) throw new NotFoundError('Song not found.');
  await repo.addSong(playlistId, songId);
};

/**
 * Removes a song from a playlist. Owner-only.
 * @param playlistId - playlist_id
 * @param userId - authenticated user_id
 * @param songId - song to remove
 */
export const removeSong = async (playlistId: number, userId: number, songId: number) => {
  const pl = await repo.findById(playlistId);
  if (!pl) throw new NotFoundError('Playlist not found.');
  if (pl.user_id !== userId) throw new ForbiddenError('Not your playlist.');
  await repo.removeSong(playlistId, songId);
};
