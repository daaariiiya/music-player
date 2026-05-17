import useSWR from 'swr';
import { albumsApi } from '../api/albums.api';

export const useAlbums = () =>
  useSWR(['albums'], () => albumsApi.list().then((r) => r.data?.items ?? []), {
    revalidateOnFocus: false,
  });
