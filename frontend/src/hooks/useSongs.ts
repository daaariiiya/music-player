import useSWR from 'swr';
import { songsApi } from '../api/songs.api';

export const useSongs = () =>
  useSWR(['songs'], () => songsApi.list().then((r) => r.data?.items ?? []), {
    revalidateOnFocus: false,
  });
