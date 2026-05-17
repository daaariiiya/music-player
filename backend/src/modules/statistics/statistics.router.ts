import { Hono } from 'hono';
import * as ctrl from './statistics.controller.js';

export const statisticsRouter = new Hono();

statisticsRouter.get('/top-songs', ctrl.topSongs);
statisticsRouter.get('/popular-genres', ctrl.popularGenres);
statisticsRouter.get('/user-preferences', ctrl.userPreferences);
