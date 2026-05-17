import useSWR from 'swr';
import { performersApi } from '../api/performers.api';

export const usePerformerById = (id: number | undefined) =>
  useSWR(
    id ? ['performer', id] : null,
    () => performersApi.getById(id as number).then((r) => r.data),
    { revalidateOnFocus: false }
  );
