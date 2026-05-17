import type { Context } from 'hono';
import { success } from '../../utils/response.js';
import { BadRequestError } from '../../utils/errors.js';
import * as service from './playlists.service.js';
import type { AddSongInput, CreatePlaylistInput } from './playlists.schema.js';

const parsePositive = (raw: string | undefined, label: string): number => {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new BadRequestError(`Invalid ${label}.`);
  return n;
};

export const list = async (c: Context) => {
  const userId = c.get('userId') as number;
  const items = await service.listMine(userId);
  return c.json(success('Your playlists.', { items }));
};

export const getOne = async (c: Context) => {
  const userId = c.get('userId') as number;
  const id = parsePositive(c.req.param('id'), 'id');
  const data = await service.getOwned(id, userId);
  return c.json(success('Playlist detail.', data));
};

export const create = async (c: Context) => {
  const userId = c.get('userId') as number;
  const body = c.get('body') as CreatePlaylistInput;
  return c.json(success('Playlist created.', await service.create(userId, body)), 201);
};

export const remove = async (c: Context) => {
  const userId = c.get('userId') as number;
  const id = parsePositive(c.req.param('id'), 'id');
  await service.remove(id, userId);
  return c.json(success('Playlist deleted.'));
};

export const addSong = async (c: Context) => {
  const userId = c.get('userId') as number;
  const id = parsePositive(c.req.param('id'), 'id');
  const body = c.get('body') as AddSongInput;
  await service.addSong(id, userId, body.song_id);
  return c.json(success('Song added.'));
};

export const removeSong = async (c: Context) => {
  const userId = c.get('userId') as number;
  const id = parsePositive(c.req.param('id'), 'id');
  const songId = parsePositive(c.req.param('songId'), 'songId');
  await service.removeSong(id, userId, songId);
  return c.json(success('Song removed.'));
};
