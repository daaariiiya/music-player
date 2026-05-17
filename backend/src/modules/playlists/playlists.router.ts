import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as ctrl from './playlists.controller.js';
import { addSongSchema, createPlaylistSchema } from './playlists.schema.js';

export const playlistsRouter = new Hono();

playlistsRouter.use('*', requireAuth);

playlistsRouter.get('/', ctrl.list);
playlistsRouter.get('/:id', ctrl.getOne);
playlistsRouter.post('/', validate(createPlaylistSchema), ctrl.create);
playlistsRouter.delete('/:id', ctrl.remove);
playlistsRouter.post('/:id/songs', validate(addSongSchema), ctrl.addSong);
playlistsRouter.delete('/:id/songs/:songId', ctrl.removeSong);
