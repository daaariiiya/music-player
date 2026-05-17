import { useState } from 'react';
import { useForm, useFieldArray, type Control, type UseFormRegister, type UseFormSetValue } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { mutate } from 'swr';
import {
  albumsApi,
  type BulkCreateAlbumItem,
  type BulkAlbumResultRow,
  type CreateAlbumPayload,
  type BulkAlbumSongPayload,
} from '../../api/albums.api';
import { usePerformers } from '../../hooks/usePerformers';
import { PhotoUploader } from '../../components/admin/PhotoUploader';
import { toast, toastError } from '../../utils/toast';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MSG = '${label} must be in YYYY-MM-DD format';

const emptyToUndef = (v: unknown, o: unknown) => (o === '' || o === null ? undefined : v);

const albumSongSchema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, { message: DATE_MSG }).label('Release date').required(),
  duration_seconds: yup.number().transform(emptyToUndef).integer().positive().label('Duration (seconds)').required(),
  photoId: yup.number().integer().positive().optional(),
});

const albumItemSchema = yup.object({
  album: yup.object({
    title: yup.string().trim().min(1).max(200).label('Title').required(),
    description: yup.string().trim().max(2000).label('Description').optional(),
    release_date: yup.string().matches(ISO_DATE, { message: DATE_MSG }).label('Release date').required(),
    performer_id: yup.number().transform(emptyToUndef).integer().positive().label('Performer').required(),
    photoId: yup.number().integer().positive().optional(),
  }).required(),
  songs: yup.array().of(albumSongSchema).default([]),
});

const formSchema = yup.object({
  items: yup.array().of(albumItemSchema).min(1).required(),
});

type FormValues = yup.InferType<typeof formSchema>;
type AlbumItem = yup.InferType<typeof albumItemSchema>;
type SongItem = yup.InferType<typeof albumSongSchema>;

const EMPTY_SONG: SongItem = {
  title: '',
  description: '',
  release_date: '',
  duration_seconds: 0 as unknown as number,
};

const EMPTY_ALBUM: AlbumItem = {
  album: {
    title: '',
    description: '',
    release_date: '',
    performer_id: 0 as unknown as number,
  },
  songs: [],
};

interface SongRowProps {
  albumIndex: number;
  songIndex: number;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  remove: () => void;
  result?: { ok: boolean; songId?: number; error?: string };
  errors?: Record<string, { message?: string }>;
}

const SongRow = ({ albumIndex, songIndex, register, setValue, remove, result, errors }: SongRowProps) => (
  <div className={`bulk-edit-card bulk-edit-card--nested ${result?.ok ? 'card--ok' : result && !result.ok ? 'card--error' : ''}`}>
    <div className="bulk-edit-header">
      <span className="bulk-edit-index">Song #{songIndex + 1}</span>
      <button type="button" onClick={remove} className="btn-ghost">Remove</button>
    </div>
    <PhotoUploader
      onUploaded={(id) => setValue(`items.${albumIndex}.songs.${songIndex}.photoId`, id)}
      onCleared={() => setValue(`items.${albumIndex}.songs.${songIndex}.photoId`, undefined)}
    />
    <div className="bulk-edit-grid">
      <input placeholder="Title" {...register(`items.${albumIndex}.songs.${songIndex}.title`)} />
      <input type="number" placeholder="Duration (seconds)" {...register(`items.${albumIndex}.songs.${songIndex}.duration_seconds`)} />
      <label>Release date<input type="date" {...register(`items.${albumIndex}.songs.${songIndex}.release_date`)} /></label>
    </div>
    {errors && Object.keys(errors).length > 0 && (
      <div className="bulk-errors">
        {Object.entries(errors).map(([field, e]) => (
          <div key={field}>• {e.message}</div>
        ))}
      </div>
    )}
    {result && (
      <div className={result.ok ? 'bulk-status-ok' : 'bulk-status-fail'}>
        {result.ok ? `✓ Song #${result.songId}` : `✗ ${result.error}`}
      </div>
    )}
  </div>
);

interface AlbumCardProps {
  index: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  setValue: UseFormSetValue<FormValues>;
  remove: () => void;
  performers: Array<{ performer_id: number; name: string }>;
  result?: BulkAlbumResultRow;
  errors?: { album?: Record<string, { message?: string }>; songs?: Array<Record<string, { message?: string }>> };
}

const AlbumCard = ({ index, control, register, setValue, remove, performers, result, errors }: AlbumCardProps) => {
  const songsArray = useFieldArray({ control, name: `items.${index}.songs` });
  const albumClass = result?.ok ? 'card--ok' : result && !result.ok ? 'card--error' : '';

  return (
    <div className={`bulk-album-edit ${albumClass}`}>
      <div className="bulk-edit-header">
        <span className="bulk-edit-index">Album #{index + 1}</span>
        <button type="button" onClick={remove} className="btn-ghost">Remove album</button>
      </div>
      <PhotoUploader
        onUploaded={(id) => setValue(`items.${index}.album.photoId`, id)}
        onCleared={() => setValue(`items.${index}.album.photoId`, undefined)}
      />
      <div className="bulk-edit-grid">
        <input placeholder="Title" {...register(`items.${index}.album.title`)} />
        <label>Release date<input type="date" {...register(`items.${index}.album.release_date`)} /></label>
        <select {...register(`items.${index}.album.performer_id`)}>
          <option value="">Select performer</option>
          {performers.map((p) => (
            <option key={p.performer_id} value={p.performer_id}>{p.name}</option>
          ))}
        </select>
        <textarea placeholder="Description (optional)" {...register(`items.${index}.album.description`)} />
      </div>
      {errors?.album && Object.keys(errors.album).length > 0 && (
        <div className="bulk-errors">
          {Object.entries(errors.album).map(([field, e]) => (
            <div key={field}>• {e.message}</div>
          ))}
        </div>
      )}
      {result && (
        <div className={result.ok ? 'bulk-status-ok' : 'bulk-status-fail'}>
          {result.ok ? `✓ Album #${result.albumId}` : `✗ ${result.error}`}
        </div>
      )}

      <div className="bulk-songs-section">
        <div className="bulk-songs-section-header">
          <h4>Songs ({songsArray.fields.length})</h4>
          <button type="button" onClick={() => songsArray.append(EMPTY_SONG)} className="btn-ghost">+ Add song</button>
        </div>
        <div className="bulk-edit-list bulk-edit-list--nested">
          {songsArray.fields.map((sf, sIdx) => (
            <SongRow
              key={sf.id}
              albumIndex={index}
              songIndex={sIdx}
              register={register}
              setValue={setValue}
              remove={() => songsArray.remove(sIdx)}
              result={result?.songResults?.[sIdx]}
              errors={errors?.songs?.[sIdx]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminAlbumsBulkPage = () => {
  const { data: performers } = usePerformers();
  const [results, setResults] = useState<BulkAlbumResultRow[] | null>(null);

  const form = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: { items: [EMPTY_ALBUM] },
  });
  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: 'items' });

  const handleJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      replace(arr);
      setResults(null);
      toast.success(`Loaded ${arr.length} album(s) from JSON.`);
    } catch {
      toast.error('Invalid JSON file.');
    } finally {
      e.target.value = '';
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setResults(null);
    try {
      const payload: BulkCreateAlbumItem[] = values.items.map((item) => ({
        album: item.album as CreateAlbumPayload,
        songs: (item.songs ?? []) as BulkAlbumSongPayload[],
      }));
      const res = await albumsApi.bulkCreate(payload);
      setResults(res.data?.results ?? null);
      toast.success(res.message);
      mutate(['albums']);
      mutate(['songs']);
    } catch (e) {
      toastError(e);
    }
  }, (errs) => {
    toast.error(String(JSON.stringify(errs).slice(0, 200)));
  });

  const totalSongs = form.watch('items').reduce((acc, it) => acc + (it.songs?.length ?? 0), 0);
  const itemErrors = (form.formState.errors.items ?? []) as Array<{
    album?: Record<string, { message?: string }>;
    songs?: Array<Record<string, { message?: string }>>;
  }>;

  return (
    <div>
      <h2>Bulk albums + songs import</h2>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="bulk-summary">
          <span>{fields.length} album{fields.length === 1 ? '' : 's'} · {totalSongs} song{totalSongs === 1 ? '' : 's'}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label className="btn-ghost bulk-json-upload">
              Load JSON
              <input type="file" accept="application/json,.json" onChange={handleJsonFile} hidden />
            </label>
            <button type="button" onClick={() => append(EMPTY_ALBUM)} className="btn-ghost">+ Add album</button>
            <button type="submit" disabled={form.formState.isSubmitting || fields.length === 0}>
              {form.formState.isSubmitting ? 'Creating...' : 'Create all'}
            </button>
          </div>
        </div>

        <div className="bulk-album-list">
          {fields.map((f, idx) => (
            <AlbumCard
              key={f.id}
              index={idx}
              control={form.control}
              register={form.register}
              setValue={form.setValue}
              remove={() => remove(idx)}
              performers={performers ?? []}
              result={results?.[idx]}
              errors={itemErrors[idx]}
            />
          ))}
        </div>
      </form>
    </div>
  );
};
