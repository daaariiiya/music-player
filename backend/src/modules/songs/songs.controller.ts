import type { Context } from 'hono';
import { success } from '../../utils/response.js';
import { BadRequestError } from '../../utils/errors.js';
import * as service from './songs.service.js';
import type { BulkCreateSongsInput, CreateSongInput, UpdateSongInput } from './songs.schema.js';

const parseId = (c: Context): number => {
  const n = Number(c.req.param('id'));
  if (!Number.isInteger(n) || n <= 0) throw new BadRequestError('Invalid id.');
  return n;
};

export const list = async (c: Context) =>
  c.json(success('Songs list.', { items: await service.listAll() }));

export const getOne = async (c: Context) =>
  c.json(success('Song detail.', await service.getById(parseId(c))));

export const create = async (c: Context) => {
  const body = c.get('body') as CreateSongInput;
  return c.json(success('Song created.', await service.create(body)), 201);
};

export const bulkCreate = async (c: Context) => {
  const body = c.get('body') as BulkCreateSongsInput;
  const results = await service.bulkCreate(body.items as CreateSongInput[]);
  const okCount = results.filter((r) => r.ok).length;
  return c.json(success(`Bulk songs import: ${okCount}/${results.length} created.`, { results }), 201);
};

export const update = async (c: Context) => {
  const body = c.get('body') as UpdateSongInput;
  await service.update(parseId(c), body);
  return c.json(success('Song updated.'));
};

export const remove = async (c: Context) => {
  await service.remove(parseId(c));
  return c.json(success('Song deleted.'));
};
