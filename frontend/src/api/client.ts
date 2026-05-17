import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '../store/auth.store';
import type { ApiResponse } from '../types';

const baseURL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
type Subscriber = (token: string | null) => void;
let subscribers: Subscriber[] = [];

const subscribe = (cb: Subscriber): void => {
  subscribers.push(cb);
};

const notify = (token: string | null): void => {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const res = await axios.post<ApiResponse<{ accessToken: string }>>(
      `${baseURL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const token = res.data.data?.accessToken ?? null;
    if (token) useAuthStore.getState().setAccessToken(token);
    return token;
  } catch {
    useAuthStore.getState().clearAuth();
    return null;
  }
};

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    // Avoid recursive refresh on /auth/refresh failure
    if (original.url?.includes('/auth/refresh')) {
      useAuthStore.getState().clearAuth();
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribe((token) => {
          if (!token) return reject(error);
          original.headers = original.headers ?? {};
          (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
          resolve(apiClient.request(original as AxiosRequestConfig));
        });
      });
    }

    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
    notify(newToken);

    if (!newToken) return Promise.reject(error);

    original.headers = original.headers ?? {};
    (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
    return apiClient.request(original as AxiosRequestConfig);
  }
);
