import { apiClient } from './client';
import type { Album, AlbumDetail, ApiResponse } from '../types';

export interface CreateAlbumPayload {
  title: string;
  description?: string;
  release_date: string;
  performer_id: number;
  photoId?: number;
  photoUrl?: string;
}

export type UpdateAlbumPayload = Partial<CreateAlbumPayload>;

export interface BulkAlbumSongPayload {
  title: string;
  description?: string;
  release_date: string;
  duration_seconds: number;
  photoId?: number;
  photoUrl?: string;
}

export interface BulkCreateAlbumItem {
  album: CreateAlbumPayload;
  songs: BulkAlbumSongPayload[];
}

export interface BulkAlbumSongResult {
  index: number;
  ok: boolean;
  songId?: number;
  error?: string;
}

export interface BulkAlbumResultRow {
  index: number;
  ok: boolean;
  albumId?: number;
  songResults?: BulkAlbumSongResult[];
  error?: string;
}

export const albumsApi = {
  list: () => apiClient.get<ApiResponse<{ items: Album[] }>>('/albums').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<AlbumDetail>>(`/albums/${id}`).then((r) => r.data),

  update: (id: number, payload: UpdateAlbumPayload) =>
    apiClient.put<ApiResponse>(`/albums/${id}`, payload).then((r) => r.data),

  remove: (id: number) => apiClient.delete<ApiResponse>(`/albums/${id}`).then((r) => r.data),

  bulkCreate: (items: BulkCreateAlbumItem[]) =>
    apiClient
      .post<ApiResponse<{ results: BulkAlbumResultRow[] }>>('/albums/bulk', { items })
      .then((r) => r.data),
};
