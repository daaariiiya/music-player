import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as ctrl from './albums.controller.js';
import { bulkCreateAlbumsSchema, updateAlbumSchema } from './albums.schema.js';

export const albumsRouter = new Hono();

albumsRouter.get('/', ctrl.list);
albumsRouter.get('/:id', ctrl.getOne);
albumsRouter.post('/bulk', requireAuth, requireAdmin, validate(bulkCreateAlbumsSchema), ctrl.bulkCreate);
albumsRouter.put('/:id', requireAuth, requireAdmin, validate(updateAlbumSchema), ctrl.update);
albumsRouter.delete('/:id', requireAuth, requireAdmin, ctrl.remove);
