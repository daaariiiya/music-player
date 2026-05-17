import type { Context } from 'hono';
import { success } from '../../utils/response.js';
import { BadRequestError } from '../../utils/errors.js';
import * as service from './groups.service.js';
import type { AddMemberInput } from './groups.schema.js';

const parsePositive = (raw: string | undefined, label: string): number => {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) throw new BadRequestError(`Invalid ${label}.`);
  return n;
};

export const list = async (c: Context) =>
  c.json(success('Groups list.', { items: await service.listAllGroups() }));

export const addMember = async (c: Context) => {
  const groupId = parsePositive(c.req.param('groupId'), 'groupId');
  const body = c.get('body') as AddMemberInput;
  await service.addMember(groupId, body);
  return c.json(success('Member added.'));
};

export const removeMember = async (c: Context) => {
  const groupId = parsePositive(c.req.param('groupId'), 'groupId');
  const artistId = parsePositive(c.req.param('artistId'), 'artistId');
  await service.removeMember(groupId, artistId);
  return c.json(success('Member removed.'));
};
