import { NotFoundError } from '../../utils/errors.js';
import * as repo from './groups.repository.js';
import * as performersRepo from '../performers/performers.repository.js';
import type { AddMemberInput } from './groups.schema.js';

/**
 * Lists all groups with current members.
 */
export const listAllGroups = () => performersRepo.listGroupsWithMembers();

/**
 * Adds an artist to a group (admin).
 * @param groupId - group_id
 * @param input - membership payload
 * @throws NotFoundError if group/artist missing
 */
export const addMember = async (groupId: number, input: AddMemberInput) => {
  const group = await repo.findGroupById(groupId);
  if (!group) throw new NotFoundError('Group not found.');
  const artist = await repo.findArtistById(input.artist_id);
  if (!artist) throw new NotFoundError('Artist not found.');
  await repo.insertMembership(groupId, input.artist_id, input.start_date);
};

/**
 * Removes an artist from a group (admin).
 * @param groupId - group_id
 * @param artistId - artist_id
 * @throws NotFoundError if group/artist missing
 */
export const removeMember = async (groupId: number, artistId: number) => {
  const group = await repo.findGroupById(groupId);
  if (!group) throw new NotFoundError('Group not found.');
  const artist = await repo.findArtistById(artistId);
  if (!artist) throw new NotFoundError('Artist not found.');
  await repo.deleteMembership(groupId, artistId);
};
