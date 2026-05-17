import * as repo from './statistics.repository.js';

/** Top 10 songs by playlist add count. */
export const getTopSongs = () => repo.topSongs();

/** Genres ranked by playlist presence. */
export const getPopularGenres = () => repo.popularGenres();

/** Artist vs group split across playlists. */
export const getUserPreferences = () => repo.userPreferences();
