import { apiClient } from './client';
import type { ApiResponse, Song, SongDetail } from '../types';

export interface CreateSongPayload {
  title: string;
  description?: string;
  release_date: string;
  duration_seconds: number;
  performer_id: number;
  album_id?: number;
  photoId?: number;
  photoUrl?: string;
}

export type UpdateSongPayload = Partial<CreateSongPayload> & { album_id?: number | null };

export interface BulkSongResultRow {
  index: number;
  ok: boolean;
  songId?: number;
  error?: string;
}

export const songsApi = {
  list: () => apiClient.get<ApiResponse<{ items: Song[] }>>('/songs').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<SongDetail>>(`/songs/${id}`).then((r) => r.data),

  update: (id: number, payload: UpdateSongPayload) =>
    apiClient.put<ApiResponse>(`/songs/${id}`, payload).then((r) => r.data),

  remove: (id: number) => apiClient.delete<ApiResponse>(`/songs/${id}`).then((r) => r.data),

  bulkCreate: (items: CreateSongPayload[]) =>
    apiClient
      .post<ApiResponse<{ results: BulkSongResultRow[] }>>('/songs/bulk', { items })
      .then((r) => r.data),
};
