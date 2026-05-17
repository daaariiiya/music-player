import useSWR from 'swr';
import { playlistsApi } from '../api/playlists.api';

export const usePlaylists = () =>
  useSWR(['playlists'], () => playlistsApi.list().then((r) => r.data?.items ?? []), {
    revalidateOnFocus: false,
  });
