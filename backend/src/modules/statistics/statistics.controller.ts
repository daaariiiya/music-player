import type { Context } from 'hono';
import { success } from '../../utils/response.js';
import * as service from './statistics.service.js';

export const topSongs = async (c: Context) =>
  c.json(success('Top songs.', { items: await service.getTopSongs() }));

export const popularGenres = async (c: Context) =>
  c.json(success('Popular genres.', { items: await service.getPopularGenres() }));

export const userPreferences = async (c: Context) =>
  c.json(success('User preferences.', await service.getUserPreferences()));
