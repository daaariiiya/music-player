import axios from 'axios';
import { toast } from 'react-toastify';

export const toastError = (err: unknown, fallback = 'Request failed.'): void => {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string } | undefined;
    toast.error(data?.message ?? err.message ?? fallback);
    return;
  }
  if (err instanceof Error) {
    toast.error(err.message);
    return;
  }
  toast.error(fallback);
};

export { toast };
