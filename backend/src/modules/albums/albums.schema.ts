import * as yup from 'yup';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MSG = '${label} must be a date in YYYY-MM-DD format';

export const createAlbumSchema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, DATE_MSG).label('Release date').required(),
  performer_id: yup.number().integer().positive().label('Performer').required(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
  photoUrl: yup.string().trim().matches(/^https?:\/\/.+/i, '${label} must be a valid http(s) URL').label('Photo URL').optional(),
});
export type CreateAlbumInput = yup.InferType<typeof createAlbumSchema>;

export const updateAlbumSchema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').optional(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, DATE_MSG).label('Release date').optional(),
  performer_id: yup.number().integer().positive().label('Performer').optional(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
});
export type UpdateAlbumInput = yup.InferType<typeof updateAlbumSchema>;

export const bulkAlbumSongSchema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, DATE_MSG).label('Release date').required(),
  duration_seconds: yup.number().integer().positive().label('Duration (seconds)').required(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
  photoUrl: yup.string().trim().matches(/^https?:\/\/.+/i, '${label} must be a valid http(s) URL').label('Photo URL').optional(),
});
export type BulkAlbumSongInput = yup.InferType<typeof bulkAlbumSongSchema>;

export const bulkCreateAlbumSchema = yup.object({
  album: createAlbumSchema.label('Album').required(),
  songs: yup.array().of(bulkAlbumSongSchema).max(100).label('Songs').default([]),
});
export type BulkCreateAlbumInput = yup.InferType<typeof bulkCreateAlbumSchema>;

export const bulkCreateAlbumsSchema = yup.object({
  items: yup.array().of(bulkCreateAlbumSchema).min(1).max(50).label('Albums').required(),
});
export type BulkCreateAlbumsInput = yup.InferType<typeof bulkCreateAlbumsSchema>;
