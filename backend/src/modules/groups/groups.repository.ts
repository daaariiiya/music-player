// Pattern: Repository
import { and, eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { music_groups } from '../../schema/music_groups.js';
import { artists } from '../../schema/artists.js';
import { artists_in_groups } from '../../schema/artists_in_groups.js';

/**
 * Finds a group by id.
 * @param groupId - group_id
 */
export const findGroupById = (groupId: number) =>
  db.select().from(music_groups).where(eq(music_groups.group_id, groupId)).limit(1).then((r) => r[0] ?? null);

/**
 * Finds an artist by id.
 * @param artistId - artist_id
 */
export const findArtistById = (artistId: number) =>
  db.select().from(artists).where(eq(artists.artist_id, artistId)).limit(1).then((r) => r[0] ?? null);

/**
 * Inserts a membership row.
 * @param groupId - group_id
 * @param artistId - artist_id
 * @param startDate - ISO date
 */
export const insertMembership = (groupId: number, artistId: number, startDate: string) =>
  db
    .insert(artists_in_groups)
    .values({ group_id: groupId, artist_id: artistId, start_date: startDate })
    .onConflictDoNothing()
    .then(() => undefined);

/**
 * Deletes all membership rows linking an artist to a group.
 * @param groupId - group_id
 * @param artistId - artist_id
 */
export const deleteMembership = (groupId: number, artistId: number) =>
  db
    .delete(artists_in_groups)
    .where(and(eq(artists_in_groups.group_id, groupId), eq(artists_in_groups.artist_id, artistId)))
    .then(() => undefined);
