import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { songsApi } from '../../api/songs.api';
import { usePerformers } from '../../hooks/usePerformers';
import { useAlbums } from '../../hooks/useAlbums';
import { useSongById } from '../../hooks/useSongById';
import { PhotoUploader } from '../../components/admin/PhotoUploader';
import { toast, toastError } from '../../utils/toast';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const DATE_MSG = '${label} must be in YYYY-MM-DD format';

const schema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, { message: DATE_MSG }).label('Release date').required(),
  duration_seconds: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : v))
    .integer()
    .positive()
    .label('Duration (seconds)')
    .required(),
  performer_id: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : v))
    .integer()
    .positive()
    .label('Performer')
    .required(),
  album_id: yup
    .number()
    .transform((v, o) => (o === '' ? undefined : v))
    .integer()
    .positive()
    .label('Album')
    .optional(),
  photoId: yup.number().integer().positive().label('Photo').optional(),
});
type FormValues = yup.InferType<typeof schema>;

interface Props {
  mode: 'create' | 'edit';
}

export const AdminSongForm = ({ mode }: Props) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const songId = mode === 'edit' ? Number(id) : undefined;
  const { data: performers } = usePerformers();
  const { data: albums } = useAlbums();
  const { data: existing } = useSongById(songId);

  const form = useForm<FormValues>({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (mode === 'edit' && existing) {
      form.reset({
        title: existing.title,
        description: existing.description ?? '',
        release_date: existing.release_date,
        duration_seconds: existing.duration_seconds,
        performer_id: existing.performer_id,
        album_id: existing.album_id ?? undefined,
        photoId: undefined,
      });
    }
  }, [existing, mode, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await songsApi.update(songId as number, values);
      toast.success('Song updated.');
      mutate(['songs']);
      mutate(['song', songId]);
      navigate(`/songs/${songId}`);
    } catch (e) {
      toastError(e);
    }
  }, (errors) => {
    const first = Object.values(errors)[0]?.message ?? 'Validation failed.';
    toast.error(String(first));
  });

  return (
    <div style={{ maxWidth: 600 }}>
      <h2>{mode === 'create' ? 'New' : 'Edit'} song</h2>
      <PhotoUploader
        initialUrl={existing?.photo_url ?? null}
        onUploaded={(photoId) => form.setValue('photoId', photoId)}
        onCleared={() => form.setValue('photoId', undefined)}
      />
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <input placeholder="Title" {...form.register('title')} />
        <textarea placeholder="Description" {...form.register('description')} />
        <label>Release date<input type="date" {...form.register('release_date')} /></label>
        <input type="number" placeholder="Duration (seconds)" {...form.register('duration_seconds')} />
        <select {...form.register('performer_id')}>
          <option value="">Select performer</option>
          {(performers ?? []).map((p) => (
            <option key={p.performer_id} value={p.performer_id}>{p.name}</option>
          ))}
        </select>
        <select {...form.register('album_id')}>
          <option value="">No album</option>
          {(albums ?? []).map((a) => (
            <option key={a.album_id} value={a.album_id}>{a.title}</option>
          ))}
        </select>
        <button type="submit" disabled={form.formState.isSubmitting}>
          {mode === 'create' ? 'Create' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export const AdminSongEditPage = () => <AdminSongForm mode="edit" />;
