import * as yup from 'yup';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const addMemberSchema = yup.object({
  artist_id: yup.number().integer().positive().required(),
  start_date: yup.string().matches(ISO_DATE).required(),
  end_date: yup.string().matches(ISO_DATE).nullable().optional(),
});
export type AddMemberInput = yup.InferType<typeof addMemberSchema>;
