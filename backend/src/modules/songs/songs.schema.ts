import * as yup from 'yup';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MSG = '${label} must be a date in YYYY-MM-DD format';

export const createSongSchema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, DATE_MSG).label('Release date').required(),
  duration_seconds: yup.number().integer().positive().label('Duration (seconds)').required(),
  performer_id: yup.number().integer().positive().label('Performer').required(),
  album_id: yup.number().integer().positive().label('Album').optional(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
  photoUrl: yup.string().trim().matches(/^https?:\/\/.+/i, '${label} must be a valid http(s) URL').label('Photo URL').optional(),
});
export type CreateSongInput = yup.InferType<typeof createSongSchema>;

export const updateSongSchema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').optional(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, DATE_MSG).label('Release date').optional(),
  duration_seconds: yup.number().integer().positive().label('Duration (seconds)').optional(),
  performer_id: yup.number().integer().positive().label('Performer').optional(),
  album_id: yup.number().integer().positive().nullable().label('Album').optional(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
});
export type UpdateSongInput = yup.InferType<typeof updateSongSchema>;

export const bulkCreateSongsSchema = yup.object({
  items: yup.array().of(createSongSchema).min(1).max(200).label('Songs').required(),
});
export type BulkCreateSongsInput = yup.InferType<typeof bulkCreateSongsSchema>;
