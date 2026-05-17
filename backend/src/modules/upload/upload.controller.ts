import type { Context } from 'hono';
import { BadRequestError } from '../../utils/errors.js';
import { success } from '../../utils/response.js';
import { photoFileSchema } from './upload.schema.js';
import * as uploadService from './upload.service.js';

export const uploadPhoto = async (c: Context) => {
  const body = await c.req.parseBody().catch(() => {
    throw new BadRequestError('Invalid multipart payload.');
  });

  const raw = body['photo'];
  if (Array.isArray(raw)) throw new BadRequestError('Only one photo allowed.');

  const file = await photoFileSchema.validate(raw);
  const result = await uploadService.uploadPhoto(file);
  return c.json(success('Photo uploaded.', result), 201);
};
