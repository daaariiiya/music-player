import { apiClient } from './client';
import type { ApiResponse } from '../types';

export const uploadApi = {
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('photo', file);
    return apiClient
      .post<ApiResponse<{ photoId: number; url: string }>>('/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
