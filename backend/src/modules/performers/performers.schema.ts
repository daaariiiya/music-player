import * as yup from 'yup';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = ['artist', 'group'] as const;
const DATE_MSG = '${label} must be a date in YYYY-MM-DD format';

export const createPerformerSchema = yup.object({
  type: yup.string().oneOf(TYPES).label('Type').required(),
  genre: yup.string().trim().min(1).max(100).label('Genre').required(),
  country: yup.string().trim().min(1).max(100).label('Country').required(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
  photoUrl: yup.string().trim().matches(/^https?:\/\/.+/i, '${label} must be a valid http(s) URL').label('Photo URL').optional(),
  name: yup.string().trim().min(1).max(100).label('Name').required(),
  bio: yup.string().trim().max(2000).label('Bio').optional(),
  birthday_date: yup
    .string()
    .label('Birthday')
    .when('type', {
      is: 'artist',
      then: (s) => s.matches(ISO_DATE, DATE_MSG).required(),
      otherwise: (s) => s.strip(),
    }),
  career_started_date: yup
    .string()
    .label('Career start date')
    .when('type', {
      is: 'artist',
      then: (s) => s.matches(ISO_DATE, DATE_MSG).required(),
      otherwise: (s) => s.strip(),
    }),
  year_created: yup
    .number()
    .label('Year created')
    .when('type', {
      is: 'group',
      then: (s) => s.integer().min(1800).max(new Date().getFullYear() + 1).required(),
      otherwise: (s) => s.strip(),
    }),
});
export type CreatePerformerInput = yup.InferType<typeof createPerformerSchema>;

export const updatePerformerSchema = yup.object({
  genre: yup.string().trim().min(1).max(100).label('Genre').optional(),
  country: yup.string().trim().min(1).max(100).label('Country').optional(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
  name: yup.string().trim().min(1).max(100).label('Name').optional(),
  bio: yup.string().trim().max(2000).label('Bio').optional(),
  birthday_date: yup.string().matches(ISO_DATE, DATE_MSG).label('Birthday').optional(),
  career_started_date: yup.string().matches(ISO_DATE, DATE_MSG).label('Career start date').optional(),
  year_created: yup.number().integer().min(1800).label('Year created').optional(),
});
export type UpdatePerformerInput = yup.InferType<typeof updatePerformerSchema>;

export const idParamSchema = yup.object({
  id: yup.number().integer().positive().label('ID').required(),
});
export type IdParam = yup.InferType<typeof idParamSchema>;

export const bulkCreatePerformersSchema = yup.object({
  items: yup.array().of(createPerformerSchema).min(1).max(100).label('Performers').required(),
});
export type BulkCreatePerformersInput = yup.InferType<typeof bulkCreatePerformersSchema>;
