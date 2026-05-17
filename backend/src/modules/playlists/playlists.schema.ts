import * as yup from 'yup';

export const createPlaylistSchema = yup.object({
  title: yup.string().trim().min(1).max(200).required(),
  description: yup.string().trim().max(2000).optional(),
});
export type CreatePlaylistInput = yup.InferType<typeof createPlaylistSchema>;

export const addSongSchema = yup.object({
  song_id: yup.number().integer().positive().required(),
});
export type AddSongInput = yup.InferType<typeof addSongSchema>;
