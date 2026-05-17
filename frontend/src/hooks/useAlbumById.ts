import useSWR from 'swr';
import { albumsApi } from '../api/albums.api';

export const useAlbumById = (id: number | undefined) =>
  useSWR(
    id ? ['album', id] : null,
    () => albumsApi.getById(id as number).then((r) => r.data),
    { revalidateOnFocus: false }
  );
