import type { Context } from 'hono';
import { success } from '../../utils/response.js';
import { BadRequestError } from '../../utils/errors.js';
import * as service from './performers.service.js';
import type { BulkCreatePerformersInput, CreatePerformerInput, UpdatePerformerInput } from './performers.schema.js';

const parseId = (c: Context, key = 'id'): number => {
  const raw = c.req.param(key);
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new BadRequestError(`Invalid ${key}.`);
  return n;
};

export const list = async (c: Context) =>
  c.json(success('Performers list.', { items: await service.listAll() }));

export const getOne = async (c: Context) => {
  const id = parseId(c);
  const data = await service.getById(id);
  return c.json(success('Performer detail.', data));
};

export const bulkCreate = async (c: Context) => {
  const body = c.get('body') as BulkCreatePerformersInput;
  const results = await service.bulkCreate(body.items as CreatePerformerInput[]);
  const okCount = results.filter((r) => r.ok).length;
  return c.json(success(`Bulk performer import: ${okCount}/${results.length} created.`, { results }), 201);
};

export const update = async (c: Context) => {
  const id = parseId(c);
  const body = c.get('body') as UpdatePerformerInput;
  await service.update(id, body);
  return c.json(success('Performer updated.'));
};

export const remove = async (c: Context) => {
  const id = parseId(c);
  await service.remove(id);
  return c.json(success('Performer deleted.'));
};

export const groupsForArtist = async (c: Context) => {
  const id = parseId(c);
  const items = await service.listGroupsForPerformer(id);
  return c.json(success('Groups for artist.', { items }));
};

export const membersForGroup = async (c: Context) => {
  const id = parseId(c);
  const items = await service.listMembersForPerformer(id);
  return c.json(success('Members of group.', { items }));
};
