// Pattern: Service
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../../config/env.js';
import { BadRequestError } from '../../utils/errors.js';
import * as uploadRepo from './upload.repository.js';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const CLOUDINARY_FOLDER = 'music-player';

/**
 * Streams a buffer to Cloudinary and resolves with the upload result.
 * @param buffer - raw image bytes
 */
const uploadBuffer = (buffer: Buffer): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error('Cloudinary upload failed.'));
        resolve(result);
      }
    );
    stream.end(buffer);
  });

/**
 * Uploads an image file to Cloudinary and persists the resulting URL.
 * @param file - browser File (from Hono multipart parser)
 * @returns photoId for the new photos row
 * @throws BadRequestError if file empty
 */
export const uploadPhoto = async (file: File): Promise<{ photoId: number; url: string }> => {
  const arrayBuffer = await file.arrayBuffer();
  if (arrayBuffer.byteLength === 0) throw new BadRequestError('Empty file.');

  const result = await uploadBuffer(Buffer.from(arrayBuffer));
  const photo = await uploadRepo.insertPhoto(result.secure_url);
  return { photoId: photo.photo_id, url: photo.url };
};
