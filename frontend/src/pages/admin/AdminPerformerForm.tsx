import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { performersApi } from '../../api/performers.api';
import { usePerformerById } from '../../hooks/usePerformerById';
import { PhotoUploader } from '../../components/admin/PhotoUploader';
import { toast, toastError } from '../../utils/toast';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const emptyToUndefined = (v: unknown, orig: unknown) => (orig === '' || orig === null ? undefined : v);

const DATE_MSG = '${label} must be in YYYY-MM-DD format';

const schema = yup.object({
  type: yup.string().oneOf(['artist', 'group']).label('Type').required(),
  genre: yup.string().trim().min(1).max(100).label('Genre').required(),
  country: yup.string().trim().min(1).max(100).label('Country').required(),
  name: yup.string().trim().min(1).max(100).label('Name').required(),
  bio: yup.string().transform(emptyToUndefined).trim().max(2000).label('Bio').optional(),
  birthday_date: yup
    .string()
    .transform(emptyToUndefined)
    .matches(ISO_DATE, { excludeEmptyString: true, message: DATE_MSG })
    .label('Birthday')
    .optional(),
  career_started_date: yup
    .string()
    .transform(emptyToUndefined)
    .matches(ISO_DATE, { excludeEmptyString: true, message: DATE_MSG })
    .label('Career start date')
    .optional(),
  year_created: yup.number().transform(emptyToUndefined).integer().min(1800).label('Year created').optional(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  mode: 'create' | 'edit';
}

export const AdminPerformerForm = ({ mode }: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const performerId = mode === 'edit' ? Number(id) : undefined;
  const { data: existing } = usePerformerById(performerId);

  const form = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { type: 'artist' },
  });

  useEffect(() => {
    if (mode === 'edit' && existing) {
      form.reset({
        type: existing.performer.type,
        genre: existing.performer.genre,
        country: existing.performer.country,
        name: existing.artist?.name ?? existing.group?.name ?? '',
        bio: existing.artist?.bio ?? existing.group?.bio ?? '',
        birthday_date: existing.artist?.birthday_date ?? undefined,
        career_started_date: existing.artist?.career_started_date ?? undefined,
        year_created: existing.group?.year_created ?? undefined,
        photoId: existing.performer.photo_id ?? undefined,
      });
    }
  }, [existing, mode, form]);

  const type = form.watch('type');

  const onSubmit = form.handleSubmit(
    async (values) => {
      try {
        // strip irrelevant fields per type to match backend schema
        const cleaned = { ...values };
        if (cleaned.type === 'artist') {
          delete (cleaned as Record<string, unknown>).year_created;
        } else {
          delete (cleaned as Record<string, unknown>).birthday_date;
          delete (cleaned as Record<string, unknown>).career_started_date;
        }
        await performersApi.update(performerId as number, cleaned);
        toast.success('Performer updated.');
        mutate(['performers']);
        mutate(['performer', performerId]);
        navigate(`/performers/${performerId}`);
      } catch (e) {
        toastError(e);
      }
    },
    (errors) => {
      const first = Object.values(errors)[0]?.message ?? 'Validation failed.';
      toast.error(String(first));
    }
  );

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{mode === 'create' ? 'New' : 'Edit'} performer</h2>
      <PhotoUploader
        initialUrl={existing?.performer.photo_url ?? null}
        onUploaded={(photoId) => form.setValue('photoId', photoId)}
        onCleared={() => form.setValue('photoId', undefined)}
      />
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <select {...form.register('type')} disabled={mode === 'edit'}>
          <option value="artist">Artist</option>
          <option value="group">Group</option>
        </select>
        <input placeholder="Name" {...form.register('name')} />
        <input placeholder="Genre" {...form.register('genre')} />
        <input placeholder="Country" {...form.register('country')} />
        <textarea placeholder="Bio" {...form.register('bio')} />
        {type === 'artist' && (
          <>
            <label>Birthday<input type="date" {...form.register('birthday_date')} /></label>
            <label>Career started<input type="date" {...form.register('career_started_date')} /></label>
          </>
        )}
        {type === 'group' && (
          <input type="number" placeholder="Year created" {...form.register('year_created')} />
        )}
        <button type="submit" disabled={form.formState.isSubmitting}>
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export const AdminPerformerEditPage = () => <AdminPerformerForm mode="edit" />;
