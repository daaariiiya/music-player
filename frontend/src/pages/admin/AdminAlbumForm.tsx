import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { albumsApi } from '../../api/albums.api';
import { usePerformers } from '../../hooks/usePerformers';
import { useAlbumById } from '../../hooks/useAlbumById';
import { PhotoUploader } from '../../components/admin/PhotoUploader';
import { toast, toastError } from '../../utils/toast';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const DATE_MSG = '${label} must be in YYYY-MM-DD format';

const schema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, { message: DATE_MSG }).label('Release date').required(),
  performer_id: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : v))
    .integer()
    .positive()
    .label('Performer')
    .required(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  mode: 'create' | 'edit';
}

export const AdminAlbumForm = ({ mode }: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const albumId = mode === 'edit' ? Number(id) : undefined;
  const { data: performers } = usePerformers();
  const { data: existing } = useAlbumById(albumId);

  const form = useForm<FormValues>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (mode === 'edit' && existing) {
      form.reset({
        title: existing.title,
        description: existing.description ?? '',
        release_date: existing.release_date,
        performer_id: existing.performer_id,
        photoId: undefined,
      });
    }
  }, [existing, mode, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      if (mode === 'create') {
        const res = await albumsApi.create(values);
        toast.success('Album created.');
        mutate(['albums']);
        navigate(`/albums/${res.data?.albumId}`);
      } else {
        await albumsApi.update(albumId as number, values);
        toast.success('Album updated.');
        mutate(['albums']);
        mutate(['album', albumId]);
        navigate(`/albums/${albumId}`);
      }
    } catch (e) {
      toastError(e);
    }
  }, (errors) => {
    const first = Object.values(errors)[0]?.message ?? 'Validation failed.';
    toast.error(String(first));
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{mode === 'create' ? 'New' : 'Edit'} album</h2>
      <PhotoUploader
        initialUrl={existing?.photo_url ?? null}
        onUploaded={(photoId) => form.setValue('photoId', photoId)}
        onCleared={() => form.setValue('photoId', undefined)}
      />
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input placeholder="Title" {...form.register('title')} />
        <textarea placeholder="Description" {...form.register('description')} />
        <label>Release date<input type="date" {...form.register('release_date')} /></label>
        <select {...form.register('performer_id')}>
          <option value="">Select performer</option>
          {(performers ?? []).map((p) => (
            <option key={p.performer_id} value={p.performer_id}>{p.name}</option>
          ))}
        </select>
        <button type="submit" disabled={form.formState.isSubmitting}>
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export const AdminAlbumCreatePage = () => <AdminAlbumForm mode="create" />;
export const AdminAlbumEditPage = () => <AdminAlbumForm mode="edit" />;
