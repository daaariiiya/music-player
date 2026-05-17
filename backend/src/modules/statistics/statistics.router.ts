import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import * as ctrl from './statistics.controller.js';

export const statisticsRouter = new Hono();

statisticsRouter.use('*', requireAuth, requireAdmin);

statisticsRouter.get('/top-songs', ctrl.topSongs);
statisticsRouter.get('/popular-genres', ctrl.popularGenres);
statisticsRouter.get('/user-preferences', ctrl.userPreferences);
