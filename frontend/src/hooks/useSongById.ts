import useSWR from 'swr';
import { songsApi } from '../api/songs.api';

export const useSongById = (id: number | undefined) =>
  useSWR(
    id ? ['song', id] : null,
    () => songsApi.getById(id as number).then((r) => r.data),
    { revalidateOnFocus: false }
  );
