import { BadRequestError, NotFoundError } from '../../utils/errors.js';
import * as repo from './performers.repository.js';
import { resolvePhotoId } from '../../services/photo.service.js';
import type { CreatePerformerInput, UpdatePerformerInput } from './performers.schema.js';

/**
 * Lists all performers (with joined display name + photo URL).
 */
export const listAll = () => repo.listPerformers();

/**
 * Returns a performer plus its artist/group detail.
 * @param id - performer_id
 * @throws NotFoundError if missing
 */
export const getById = async (id: number) => {
  const row = await repo.findPerformerWithDetails(id);
  if (!row) throw new NotFoundError('Performer not found.');
  return row;
};

/**
 * Creates a performer + its discriminated artist/group row.
 * @param input - validated create payload
 */
export const create = async (input: CreatePerformerInput) => {
  const photo_id = (await resolvePhotoId(input.photoId, input.photoUrl)) ?? null;
  const performer = await repo.insertPerformer({
    type: input.type,
    genre: input.genre,
    country: input.country,
    photo_id,
  });

  if (input.type === 'artist') {
    if (!input.birthday_date || !input.career_started_date) {
      throw new BadRequestError('birthday_date and career_started_date required for artist.');
    }
    await repo.insertArtist({
      performer_id: performer.performer_id,
      name: input.name,
      birthday_date: input.birthday_date,
      career_started_date: input.career_started_date,
      bio: input.bio ?? null,
    });
  } else {
    if (!input.year_created) throw new BadRequestError('year_created required for group.');
    await repo.insertMusicGroup({
      performer_id: performer.performer_id,
      name: input.name,
      year_created: input.year_created,
      bio: input.bio ?? null,
    });
  }

  return { performerId: performer.performer_id };
};

export interface BulkResultRow {
  index: number;
  ok: boolean;
  performerId?: number;
  error?: string;
}

/**
 * Bulk creates performers. Per-item independent: failures don't roll back successes.
 * @param items - validated create payloads
 * @returns row-level result list
 */
export const bulkCreate = async (items: CreatePerformerInput[]): Promise<BulkResultRow[]> => {
  const results: BulkResultRow[] = [];
  for (let i = 0; i < items.length; i++) {
    try {
      const { performerId } = await create(items[i]);
      results.push({ index: i, ok: true, performerId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      results.push({ index: i, ok: false, error: message });
    }
  }
  return results;
};

/**
 * Updates a performer + its artist/group child.
 * @param id - performer_id
 * @param input - partial update payload
 * @throws NotFoundError if missing
 */
export const update = async (id: number, input: UpdatePerformerInput) => {
  const existing = await repo.findPerformerWithDetails(id);
  if (!existing) throw new NotFoundError('Performer not found.');

  await repo.updatePerformer(id, {
    ...(input.genre !== undefined && { genre: input.genre }),
    ...(input.country !== undefined && { country: input.country }),
    ...(input.photoId !== undefined && { photo_id: input.photoId }),
  });

  if (existing.artist) {
    await repo.updateArtistByPerformer(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.birthday_date !== undefined && { birthday_date: input.birthday_date }),
      ...(input.career_started_date !== undefined && { career_started_date: input.career_started_date }),
    });
  } else if (existing.group) {
    await repo.updateGroupByPerformer(id, {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.bio !== undefined && { bio: input.bio }),
      ...(input.year_created !== undefined && { year_created: input.year_created }),
    });
  }
};

/**
 * Deletes a performer cascading artist/group + memberships.
 * @param id - performer_id
 * @throws NotFoundError if missing
 */
export const remove = async (id: number) => {
  const existing = await repo.findPerformerWithDetails(id);
  if (!existing) throw new NotFoundError('Performer not found.');
  await repo.deletePerformer(id);
};

/**
 * Lists groups an artist performer belongs to.
 * @param performerId - performer_id (must be type=artist)
 */
export const listGroupsForPerformer = async (performerId: number) => {
  const existing = await repo.findPerformerWithDetails(performerId);
  if (!existing) throw new NotFoundError('Performer not found.');
  if (existing.performer.type !== 'artist') throw new BadRequestError('Performer is not an artist.');
  return repo.listGroupsForArtist(performerId);
};

/**
 * Lists members of a group performer.
 * @param performerId - performer_id (must be type=group)
 */
export const listMembersForPerformer = async (performerId: number) => {
  const existing = await repo.findPerformerWithDetails(performerId);
  if (!existing) throw new NotFoundError('Performer not found.');
  if (existing.performer.type !== 'group') throw new BadRequestError('Performer is not a group.');
  return repo.listMembersForGroup(performerId);
};
