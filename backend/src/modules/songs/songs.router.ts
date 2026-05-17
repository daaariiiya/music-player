import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as ctrl from './songs.controller.js';
import { bulkCreateSongsSchema, createSongSchema, updateSongSchema } from './songs.schema.js';

export const songsRouter = new Hono();

songsRouter.get('/', ctrl.list);
songsRouter.get('/:id', ctrl.getOne);
songsRouter.post('/', requireAuth, requireAdmin, validate(createSongSchema), ctrl.create);
songsRouter.post('/bulk', requireAuth, requireAdmin, validate(bulkCreateSongsSchema), ctrl.bulkCreate);
songsRouter.put('/:id', requireAuth, requireAdmin, validate(updateSongSchema), ctrl.update);
songsRouter.delete('/:id', requireAuth, requireAdmin, ctrl.remove);
