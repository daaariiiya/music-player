import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.middleware.js';
import { success } from './utils/response.js';
import { authRouter } from './modules/auth/auth.router.js';
import { uploadRouter } from './modules/upload/upload.router.js';
import { performersRouter } from './modules/performers/performers.router.js';
import { albumsRouter } from './modules/albums/albums.router.js';
import { songsRouter } from './modules/songs/songs.router.js';
import { playlistsRouter } from './modules/playlists/playlists.router.js';
import { groupsRouter } from './modules/groups/groups.router.js';
import { statisticsRouter } from './modules/statistics/statistics.router.js';

export const app = new Hono();

app.use('*', logger());
app.use(
  '*',
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

app.get('/health', (c) => c.json(success('OK', { status: 'healthy' })));

app.route('/auth', authRouter);
app.route('/upload', uploadRouter);
app.route('/performers', performersRouter);
app.route('/albums', albumsRouter);
app.route('/songs', songsRouter);
app.route('/playlists', playlistsRouter);
app.route('/groups', groupsRouter);
app.route('/statistics', statisticsRouter);

app.notFound((c) => c.json({ success: false, message: 'Route not found.' }, 404));

app.onError(errorHandler);
