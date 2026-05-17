import useSWR from 'swr';
import { performersApi } from '../api/performers.api';

export const usePerformers = () =>
  useSWR(['performers'], () => performersApi.list().then((r) => r.data?.items ?? []), {
    revalidateOnFocus: false,
  });
