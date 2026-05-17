import { apiClient } from './client';
import type {
  ApiResponse,
  GenrePopularityRow,
  TopSongRow,
  UserPreferences,
} from '../types';

export const statisticsApi = {
  topSongs: () =>
    apiClient
      .get<ApiResponse<{ items: TopSongRow[] }>>('/statistics/top-songs')
      .then((r) => r.data),

  popularGenres: () =>
    apiClient
      .get<ApiResponse<{ items: GenrePopularityRow[] }>>('/statistics/popular-genres')
      .then((r) => r.data),

  userPreferences: () =>
    apiClient
      .get<ApiResponse<UserPreferences>>('/statistics/user-preferences')
      .then((r) => r.data),
};
