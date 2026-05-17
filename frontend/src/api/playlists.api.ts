import { apiClient } from './client';
import type { ApiResponse, Playlist, PlaylistWithSongs } from '../types';

export interface CreatePlaylistPayload {
  title: string;
  description?: string;
}

export const playlistsApi = {
  list: () =>
    apiClient.get<ApiResponse<{ items: Playlist[] }>>('/playlists').then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<PlaylistWithSongs>>(`/playlists/${id}`).then((r) => r.data),

  create: (payload: CreatePlaylistPayload) =>
    apiClient
      .post<ApiResponse<{ playlistId: number }>>('/playlists', payload)
      .then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete<ApiResponse>(`/playlists/${id}`).then((r) => r.data),

  addSong: (playlistId: number, songId: number) =>
    apiClient
      .post<ApiResponse>(`/playlists/${playlistId}/songs`, { song_id: songId })
      .then((r) => r.data),

  removeSong: (playlistId: number, songId: number) =>
    apiClient
      .delete<ApiResponse>(`/playlists/${playlistId}/songs/${songId}`)
      .then((r) => r.data),
};
