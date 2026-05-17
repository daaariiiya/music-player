import useSWR from 'swr';
import { statisticsApi } from '../api/statistics.api';

export const useStatistics = () =>
  useSWR(
    ['statistics'],
    async () => {
      const [top, genres, prefs] = await Promise.all([
        statisticsApi.topSongs(),
        statisticsApi.popularGenres(),
        statisticsApi.userPreferences(),
      ]);
      return {
        top_songs: top.data?.items ?? [],
        popular_genres: genres.data?.items ?? [],
        user_preferences: prefs.data ?? { artist: { count: 0, share: 0 }, group: { count: 0, share: 0 }, total: 0 },
      };
    },
    { revalidateOnFocus: false }
  );
