import { apiClient } from './client';
import type { ApiResponse, GroupMember, Performer, PerformerDetail } from '../types';

export interface CreatePerformerPayload {
  type: 'artist' | 'group';
  genre: string;
  country: string;
  photoId?: number;
  photoUrl?: string;
  name: string;
  bio?: string;
  birthday_date?: string;
  career_started_date?: string;
  year_created?: number;
}

export type UpdatePerformerPayload = Partial<CreatePerformerPayload>;

export interface BulkPerformerResultRow {
  index: number;
  ok: boolean;
  performerId?: number;
  error?: string;
}

export const performersApi = {
  list: () =>
    apiClient
      .get<ApiResponse<{ items: Performer[] }>>('/performers')
      .then((r) => r.data),

  getById: (id: number) =>
    apiClient.get<ApiResponse<PerformerDetail>>(`/performers/${id}`).then((r) => r.data),

  update: (id: number, payload: UpdatePerformerPayload) =>
    apiClient.put<ApiResponse>(`/performers/${id}`, payload).then((r) => r.data),

  remove: (id: number) =>
    apiClient.delete<ApiResponse>(`/performers/${id}`).then((r) => r.data),

  groupsForArtist: (id: number) =>
    apiClient
      .get<ApiResponse<{ items: Array<{ group_id: number; name: string; start_date: string; end_date: string | null }> }>>(
        `/performers/${id}/groups`
      )
      .then((r) => r.data),

  bulkCreate: (items: CreatePerformerPayload[]) =>
    apiClient
      .post<ApiResponse<{ results: BulkPerformerResultRow[] }>>('/performers/bulk', { items })
      .then((r) => r.data),

  membersForGroup: (id: number) =>
    apiClient
      .get<ApiResponse<{ items: GroupMember[] }>>(`/performers/${id}/members`)
      .then((r) => r.data),
};
