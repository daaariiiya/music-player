// Pattern: Repository
import { eq } from 'drizzle-orm';
import { db } from '../../config/database.js';
import { performers, type Performer, type NewPerformer } from '../../schema/performers.js';
import { artists, type Artist, type NewArtist } from '../../schema/artists.js';
import { music_groups, type MusicGroup, type NewMusicGroup } from '../../schema/music_groups.js';
import { artists_in_groups } from '../../schema/artists_in_groups.js';
import { photos } from '../../schema/photos.js';

export interface PerformerListRow {
  performer_id: number;
  type: string;
  genre: string;
  country: string;
  photo_url: string | null;
  name: string;
}

/**
 * Lists all performers joined with their artist or group name (and photo URL).
 */
export const listPerformers = async (): Promise<PerformerListRow[]> => {
  const rows = await db
    .select({
      performer_id: performers.performer_id,
      type: performers.type,
      genre: performers.genre,
      country: performers.country,
      photo_url: photos.url,
      artist_name: artists.name,
      group_name: music_groups.name,
    })
    .from(performers)
    .leftJoin(photos, eq(performers.photo_id, photos.photo_id))
    .leftJoin(artists, eq(artists.performer_id, performers.performer_id))
    .leftJoin(music_groups, eq(music_groups.performer_id, performers.performer_id));

  return rows.map((r) => ({
    performer_id: r.performer_id,
    type: r.type,
    genre: r.genre,
    country: r.country,
    photo_url: r.photo_url,
    name: r.artist_name ?? r.group_name ?? '',
  }));
};

/**
 * Fetches a performer plus its associated artist/group detail row.
 * @param performerId - performer_id
 */
export const findPerformerWithDetails = async (
  performerId: number
): Promise<{
  performer: Performer & { photo_url: string | null };
  artist: Artist | null;
  group: MusicGroup | null;
} | null> => {
  const row = await db
    .select({
      performer: performers,
      photo: photos,
      artist: artists,
      group: music_groups,
    })
    .from(performers)
    .leftJoin(photos, eq(performers.photo_id, photos.photo_id))
    .leftJoin(artists, eq(artists.performer_id, performers.performer_id))
    .leftJoin(music_groups, eq(music_groups.performer_id, performers.performer_id))
    .where(eq(performers.performer_id, performerId))
    .limit(1)
    .then((r) => r[0]);

  if (!row) return null;

  return {
    performer: { ...row.performer, photo_url: row.photo?.url ?? null },
    artist: row.artist,
    group: row.group,
  };
};

/**
 * Inserts a performer base row.
 * @param data - performer insert payload
 */
export const insertPerformer = (data: NewPerformer): Promise<Performer> =>
  db.insert(performers).values(data).returning().then((r) => r[0]);

/**
 * Inserts an artist row linked to a performer.
 * @param data - artist insert payload
 */
export const insertArtist = (data: NewArtist): Promise<Artist> =>
  db.insert(artists).values(data).returning().then((r) => r[0]);

/**
 * Inserts a group row linked to a performer.
 * @param data - group insert payload
 */
export const insertMusicGroup = (data: NewMusicGroup): Promise<MusicGroup> =>
  db.insert(music_groups).values(data).returning().then((r) => r[0]);

/**
 * Updates the base performer row.
 * @param performerId - performer_id
 * @param data - partial update payload
 */
export const updatePerformer = (
  performerId: number,
  data: Partial<NewPerformer>
): Promise<void> =>
  Object.keys(data).length === 0
    ? Promise.resolve()
    : db
        .update(performers)
        .set(data)
        .where(eq(performers.performer_id, performerId))
        .then(() => undefined);

/**
 * Updates the artist row linked to the given performer.
 * @param performerId - performer_id
 * @param data - partial artist payload
 */
export const updateArtistByPerformer = (
  performerId: number,
  data: Partial<NewArtist>
): Promise<void> =>
  Object.keys(data).length === 0
    ? Promise.resolve()
    : db
        .update(artists)
        .set(data)
        .where(eq(artists.performer_id, performerId))
        .then(() => undefined);

/**
 * Updates the group row linked to the given performer.
 * @param performerId - performer_id
 * @param data - partial group payload
 */
export const updateGroupByPerformer = (
  performerId: number,
  data: Partial<NewMusicGroup>
): Promise<void> =>
  Object.keys(data).length === 0
    ? Promise.resolve()
    : db
        .update(music_groups)
        .set(data)
        .where(eq(music_groups.performer_id, performerId))
        .then(() => undefined);

/**
 * Deletes a performer (cascades manually: artist/group rows + memberships).
 * @param performerId - performer_id
 */
export const deletePerformer = async (performerId: number): Promise<void> => {
  // remove memberships if artist
  const linkedArtist = await db
    .select({ id: artists.artist_id })
    .from(artists)
    .where(eq(artists.performer_id, performerId))
    .then((r) => r[0]);
  if (linkedArtist) {
    await db.delete(artists_in_groups).where(eq(artists_in_groups.artist_id, linkedArtist.id));
  }

  // remove memberships if group
  const linkedGroup = await db
    .select({ id: music_groups.group_id })
    .from(music_groups)
    .where(eq(music_groups.performer_id, performerId))
    .then((r) => r[0]);
  if (linkedGroup) {
    await db.delete(artists_in_groups).where(eq(artists_in_groups.group_id, linkedGroup.id));
  }

  await db.delete(artists).where(eq(artists.performer_id, performerId));
  await db.delete(music_groups).where(eq(music_groups.performer_id, performerId));
  await db.delete(performers).where(eq(performers.performer_id, performerId));
};

/**
 * Lists groups a given artist (by performer_id) currently belongs to (end_date null or future).
 * @param artistPerformerId - performer_id of artist
 */
export const listGroupsForArtist = async (artistPerformerId: number) => {
  const artist = await db
    .select({ id: artists.artist_id })
    .from(artists)
    .where(eq(artists.performer_id, artistPerformerId))
    .then((r) => r[0]);
  if (!artist) return [];

  return db
    .select({
      group_id: music_groups.group_id,
      performer_id: music_groups.performer_id,
      name: music_groups.name,
      year_created: music_groups.year_created,
      start_date: artists_in_groups.start_date,
      end_date: artists_in_groups.end_date,
    })
    .from(artists_in_groups)
    .innerJoin(music_groups, eq(music_groups.group_id, artists_in_groups.group_id))
    .where(eq(artists_in_groups.artist_id, artist.id));
};

/**
 * Lists members (artists) of a given group (by performer_id).
 * @param groupPerformerId - performer_id of group
 */
export const listMembersForGroup = async (groupPerformerId: number) => {
  const group = await db
    .select({ id: music_groups.group_id })
    .from(music_groups)
    .where(eq(music_groups.performer_id, groupPerformerId))
    .then((r) => r[0]);
  if (!group) return [];

  return db
    .select({
      artist_id: artists.artist_id,
      performer_id: artists.performer_id,
      name: artists.name,
      birthday_date: artists.birthday_date,
      start_date: artists_in_groups.start_date,
      end_date: artists_in_groups.end_date,
    })
    .from(artists_in_groups)
    .innerJoin(artists, eq(artists.artist_id, artists_in_groups.artist_id))
    .where(eq(artists_in_groups.group_id, group.id));
};

/**
 * Lists groups with their current members (end_date is null).
 */
export const listGroupsWithMembers = async () => {
  const rows = await db
    .select({
      group_id: music_groups.group_id,
      performer_id: music_groups.performer_id,
      group_name: music_groups.name,
      year_created: music_groups.year_created,
      artist_id: artists.artist_id,
      artist_name: artists.name,
      start_date: artists_in_groups.start_date,
      end_date: artists_in_groups.end_date,
    })
    .from(music_groups)
    .leftJoin(artists_in_groups, eq(artists_in_groups.group_id, music_groups.group_id))
    .leftJoin(artists, eq(artists.artist_id, artists_in_groups.artist_id));

  const map = new Map<number, { group_id: number; performer_id: number; name: string; year_created: number; members: Array<{ artist_id: number; name: string; start_date: string; end_date: string | null }> }>();
  for (const r of rows) {
    if (!map.has(r.group_id)) {
      map.set(r.group_id, {
        group_id: r.group_id,
        performer_id: r.performer_id,
        name: r.group_name,
        year_created: r.year_created,
        members: [],
      });
    }
    if (r.artist_id && r.artist_name && r.start_date) {
      map.get(r.group_id)!.members.push({
        artist_id: r.artist_id,
        name: r.artist_name,
        start_date: r.start_date,
        end_date: r.end_date,
      });
    }
  }
  return Array.from(map.values());
};

