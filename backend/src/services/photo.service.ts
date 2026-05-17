// Pattern: Service
import { insertPhoto } from '../modules/upload/upload.repository.js';

const URL_RE = /^https?:\/\/.+/i;

/**
 * Resolves a final photoId for a bulk record.
 * Precedence: explicit `photoId` wins. Otherwise, if `photoUrl` is a valid http(s) URL,
 * a new `photos` row is created and its id returned. Otherwise `undefined`.
 *
 * @param photoId - explicit photo id (if user pre-uploaded)
 * @param photoUrl - external URL to register in the `photos` table
 */
export const resolvePhotoId = async (
  photoId?: number,
  photoUrl?: string
): Promise<number | undefined> => {
  if (typeof photoId === 'number' && photoId > 0) return photoId;
  if (typeof photoUrl === 'string' && URL_RE.test(photoUrl.trim())) {
    const row = await insertPhoto(photoUrl.trim());
    return row.photo_id;
  }
  return undefined;
};
