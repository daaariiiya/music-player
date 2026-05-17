import { apiClient } from './client';
import type { ApiResponse, User } from '../types';

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient
      .post<ApiResponse<{ user: User }>>('/auth/register', payload)
      .then((r) => r.data),

  verifyEmail: (token: string) =>
    apiClient
      .get<ApiResponse>('/auth/verify-email', { params: { token } })
      .then((r) => r.data),

  login: (payload: LoginPayload) =>
    apiClient
      .post<ApiResponse<LoginResponse>>('/auth/login', payload)
      .then((r) => r.data),

  refresh: () =>
    apiClient
      .post<ApiResponse<{ accessToken: string }>>('/auth/refresh')
      .then((r) => r.data),

  logout: () => apiClient.post<ApiResponse>('/auth/logout').then((r) => r.data),

  me: () => apiClient.get<ApiResponse<{ user: User }>>('/auth/me').then((r) => r.data),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    apiClient.post<ApiResponse>('/auth/forgot-password', payload).then((r) => r.data),

  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<ApiResponse>('/auth/reset-password', payload).then((r) => r.data),
};
