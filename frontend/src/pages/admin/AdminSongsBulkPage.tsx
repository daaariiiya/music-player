import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, useWatch, type Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { mutate } from 'swr';
import { songsApi, type CreateSongPayload, type BulkSongResultRow } from '../../api/songs.api';
import { usePerformers } from '../../hooks/usePerformers';
import { useAlbums } from '../../hooks/useAlbums';
import { PhotoUploader } from '../../components/admin/PhotoUploader';
import { toast, toastError } from '../../utils/toast';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MSG = '${label} must be in YYYY-MM-DD format';

const emptyToUndef = (v: unknown, o: unknown) => (o === '' || o === null ? undefined : v);

const itemSchema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
  release_date: yup.string().matches(ISO_DATE, { message: DATE_MSG }).label('Release date').required(),
  duration_seconds: yup
    .number()
    .transform(emptyToUndef)
    .integer()
    .positive()
    .label('Duration (seconds)')
    .required(),
  performer_id: yup
    .number()
    .transform(emptyToUndef)
    .integer()
    .positive()
    .label('Performer')
    .required(),
  album_id: yup
    .number()
    .transform(emptyToUndef)
    .integer()
    .positive()
    .label('Album')
    .optional(),
  photoId: yup.number().integer().positive().optional(),
});

const formSchema = yup.object({
  items: yup.array().of(itemSchema).min(1).required(),
});

type FormValues = yup.InferType<typeof formSchema>;
type Item = yup.InferType<typeof itemSchema>;

const EMPTY: Item = {
  title: '',
  description: '',
  release_date: '',
  duration_seconds: 0 as unknown as number,
  performer_id: 0 as unknown as number,
};

interface CardProps {
  index: number;
  control: Control<FormValues>;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  setValue: ReturnType<typeof useForm<FormValues>>['setValue'];
  remove: () => void;
  performers: Array<{ performer_id: number; name: string }>;
  albums: Array<{ album_id: number; title: string; performer_id: number }>;
  result?: BulkSongResultRow;
  errors?: Record<string, { message?: string }>;
}

const SongCard = ({ index, control, register, setValue, remove, performers, albums, result, errors }: CardProps) => {
  const rowPerformer = useWatch({ control, name: `items.${index}.performer_id` });
  const rowAlbum = useWatch({ control, name: `items.${index}.album_id` });
  const performerId = Number(rowPerformer) || 0;
  const filteredAlbums = useMemo(
    () => (performerId > 0 ? albums.filter((a) => Number(a.performer_id) === performerId) : []),
    [albums, performerId]
  );

  // If selected album doesn't belong to selected performer anymore → clear it
  useEffect(() => {
    if (!rowAlbum) return;
    const id = typeof rowAlbum === 'string' ? Number(rowAlbum) : rowAlbum;
    if (performerId && !albums.some((a) => a.album_id === id && a.performer_id === performerId)) {
      setValue(`items.${index}.album_id`, undefined);
    }
  }, [performerId, rowAlbum, albums, index, setValue]);

  return (
    <div className={`bulk-edit-card ${result?.ok ? 'card--ok' : result && !result.ok ? 'card--error' : ''}`}>
      <div className="bulk-edit-header">
        <span className="bulk-edit-index">#{index + 1}</span>
        <button type="button" onClick={remove} className="btn-ghost">Remove</button>
      </div>
      <PhotoUploader
        onUploaded={(id) => setValue(`items.${index}.photoId`, id)}
        onCleared={() => setValue(`items.${index}.photoId`, undefined)}
      />
      <div className="bulk-edit-grid">
        <input placeholder="Title" {...register(`items.${index}.title`)} />
        <input type="number" placeholder="Duration (seconds)" {...register(`items.${index}.duration_seconds`)} />
        <label>Release date<input type="date" {...register(`items.${index}.release_date`)} /></label>
        <select {...register(`items.${index}.performer_id`)}>
          <option value="">Select performer</option>
          {performers.map((p) => (
            <option key={p.performer_id} value={p.performer_id}>{p.name}</option>
          ))}
        </select>
        <select {...register(`items.${index}.album_id`)} disabled={performerId === 0}>
          <option value="">{performerId > 0 ? 'No album' : 'Pick performer first'}</option>
          {filteredAlbums.map((a) => (
            <option key={a.album_id} value={a.album_id}>{a.title}</option>
          ))}
        </select>
        <textarea placeholder="Description (optional)" {...register(`items.${index}.description`)} />
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
          {result.ok ? `✓ Created #${result.songId}` : `✗ ${result.error}`}
        </div>
      )}
    </div>
  );
};

export const AdminSongsBulkPage = () => {
  const { data: performers } = usePerformers();
  const { data: albums } = useAlbums();
  const [results, setResults] = useState<BulkSongResultRow[] | null>(null);
  const [globalPerformer, setGlobalPerformer] = useState<number | ''>('');
  const [globalAlbum, setGlobalAlbum] = useState<number | ''>('');

  const form = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: { items: [EMPTY] },
  });
  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: 'items' });

  const filteredGlobalAlbums = useMemo(
    () => (globalPerformer === '' ? [] : (albums ?? []).filter((a) => Number(a.performer_id) === Number(globalPerformer))),
    [albums, globalPerformer]
  );

  // Clear global album when performer changes if it no longer matches
  useEffect(() => {
    if (globalAlbum === '') return;
    if (globalPerformer === '') return;
    const ok = (albums ?? []).some((a) => a.album_id === globalAlbum && a.performer_id === globalPerformer);
    if (!ok) setGlobalAlbum('');
  }, [globalPerformer, globalAlbum, albums]);

  const applyPerformerToAll = () => {
    if (globalPerformer === '') {
      toast.error('Pick a performer first.');
      return;
    }
    fields.forEach((_, idx) => form.setValue(`items.${idx}.performer_id`, globalPerformer));
    toast.success(`Performer applied to ${fields.length} song(s).`);
  };

  const applyAlbumToAll = () => {
    const value = globalAlbum === '' ? undefined : globalAlbum;
    fields.forEach((_, idx) => form.setValue(`items.${idx}.album_id`, value));
    toast.success(
      value === undefined
        ? `Cleared album on ${fields.length} song(s).`
        : `Album applied to ${fields.length} song(s).`
    );
  };

  const handleJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : [parsed];
      replace(arr);
      setResults(null);
      toast.success(`Loaded ${arr.length} row(s) from JSON.`);
    } catch {
      toast.error('Invalid JSON file.');
    } finally {
      e.target.value = '';
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setResults(null);
    try {
      const res = await songsApi.bulkCreate(values.items as CreateSongPayload[]);
      setResults(res.data?.results ?? null);
      toast.success(res.message);
      mutate(['songs']);
    } catch (e) {
      toastError(e);
    }
  }, (errs) => {
    const first = Object.values(errs.items ?? {})[0];
    const msg = first && typeof first === 'object' ? Object.values(first)[0]?.message : 'Validation failed.';
    toast.error(String(msg ?? 'Validation failed.'));
  });

  const itemErrors = (form.formState.errors.items ?? []) as Array<Record<string, { message?: string }>>;

  return (
    <div>
      <h2>Bulk songs import</h2>

      <div className="bulk-defaults">
        <label>
          Performer
          <div className="bulk-defaults-row">
            <select value={globalPerformer} onChange={(e) => setGlobalPerformer(e.target.value ? Number(e.target.value) : '')}>
              <option value="" disabled>— pick —</option>
              {(performers ?? []).map((p) => (
                <option key={p.performer_id} value={p.performer_id}>{p.name}</option>
              ))}
            </select>
            <button type="button" onClick={applyPerformerToAll} className="btn-ghost">Apply to all</button>
          </div>
        </label>
        <label>
          Album
          <div className="bulk-defaults-row">
            <select
              value={globalAlbum}
              onChange={(e) => setGlobalAlbum(e.target.value ? Number(e.target.value) : '')}
              disabled={globalPerformer === ''}
            >
              <option value="">{globalPerformer === '' ? 'Pick performer first' : 'No album'}</option>
              {filteredGlobalAlbums.map((a) => (
                <option key={a.album_id} value={a.album_id}>{a.title}</option>
              ))}
            </select>
            <button type="button" onClick={applyAlbumToAll} className="btn-ghost">Apply to all</button>
          </div>
        </label>
      </div>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="bulk-summary">
          <span>{fields.length} song{fields.length === 1 ? '' : 's'}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label className="btn-ghost bulk-json-upload">
              Load JSON
              <input type="file" accept="application/json,.json" onChange={handleJsonFile} hidden />
            </label>
            <button
              type="button"
              onClick={() => append({
                ...EMPTY,
                performer_id: (globalPerformer === '' ? 0 : globalPerformer) as unknown as number,
                album_id: globalAlbum === '' ? undefined : globalAlbum,
              })}
              className="btn-ghost"
            >+ Add row</button>
            <button type="submit" disabled={form.formState.isSubmitting || fields.length === 0}>
              {form.formState.isSubmitting ? 'Creating...' : `Create all (${fields.length})`}
            </button>
          </div>
        </div>

        <div className="bulk-edit-list">
          {fields.map((f, idx) => (
            <SongCard
              key={f.id}
              index={idx}
              control={form.control}
              register={form.register}
              setValue={form.setValue}
              remove={() => remove(idx)}
              performers={performers ?? []}
              albums={albums ?? []}
              result={results?.[idx]}
              errors={itemErrors[idx]}
            />
          ))}
        </div>
      </form>
    </div>
  );
};
