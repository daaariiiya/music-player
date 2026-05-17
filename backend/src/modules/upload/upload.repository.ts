// Pattern: Repository
import { db } from '../../config/database.js';
import { photos, type Photo } from '../../schema/photos.js';

/**
 * Inserts a new photo record.
 * @param url - Cloudinary secure URL
 * @returns inserted photo row
 */
export const insertPhoto = (url: string): Promise<Photo> =>
  db.insert(photos).values({ url }).returning().then((r) => r[0]);
