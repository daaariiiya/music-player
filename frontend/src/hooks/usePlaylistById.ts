import useSWR from 'swr';
import { playlistsApi } from '../api/playlists.api';

export const usePlaylistById = (id: number | undefined) =>
  useSWR(
    id ? ['playlist', id] : null,
    () => playlistsApi.getById(id as number).then((r) => r.data),
    { revalidateOnFocus: false }
  );
