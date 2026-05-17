import { useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { mutate } from 'swr';
import { performersApi, type CreatePerformerPayload, type BulkPerformerResultRow } from '../../api/performers.api';
import { PhotoUploader } from '../../components/admin/PhotoUploader';
import { toast, toastError } from '../../utils/toast';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DATE_MSG = '${label} must be in YYYY-MM-DD format';

const itemSchema = yup.object({
  type: yup.string().oneOf(['artist', 'group']).label('Type').required(),
  name: yup.string().trim().min(1).max(100).label('Name').required(),
  genre: yup.string().trim().min(1).max(100).label('Genre').required(),
  country: yup.string().trim().min(1).max(100).label('Country').required(),
  bio: yup.string().trim().max(2000).label('Bio').optional(),
  birthday_date: yup.string().matches(ISO_DATE, { message: DATE_MSG, excludeEmptyString: true }).label('Birthday').optional(),
  career_started_date: yup.string().matches(ISO_DATE, { message: DATE_MSG, excludeEmptyString: true }).label('Career start date').optional(),
  year_created: yup
    .number()
    .transform((v, o) => (o === '' || o === null ? undefined : v))
    .integer()
    .min(1800)
    .label('Year created')
    .optional(),
  photoId: yup.number().integer().positive().optional(),
});

const formSchema = yup.object({
  items: yup.array().of(itemSchema).min(1).required(),
});

type FormValues = yup.InferType<typeof formSchema>;
type Item = yup.InferType<typeof itemSchema>;

const EMPTY_ARTIST: Item = {
  type: 'artist',
  name: '',
  genre: '',
  country: '',
  bio: '',
  birthday_date: '',
  career_started_date: '',
};

interface CardProps {
  index: number;
  control: Control<FormValues>;
  register: ReturnType<typeof useForm<FormValues>>['register'];
  setValue: ReturnType<typeof useForm<FormValues>>['setValue'];
  remove: () => void;
  result?: BulkPerformerResultRow;
  errors?: Record<string, { message?: string }>;
}

const PerformerCard = ({ index, control, register, setValue, remove, result, errors }: CardProps) => {
  const type = useWatch({ control, name: `items.${index}.type` });
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
        <select {...register(`items.${index}.type`)}>
          <option value="artist">Artist</option>
          <option value="group">Group</option>
        </select>
        <input placeholder="Name" {...register(`items.${index}.name`)} />
        <input placeholder="Genre" {...register(`items.${index}.genre`)} />
        <input placeholder="Country" {...register(`items.${index}.country`)} />
        {type === 'artist' && (
          <>
            <label>Birthday<input type="date" {...register(`items.${index}.birthday_date`)} /></label>
            <label>Career start<input type="date" {...register(`items.${index}.career_started_date`)} /></label>
          </>
        )}
        {type === 'group' && (
          <input type="number" placeholder="Year created" {...register(`items.${index}.year_created`)} />
        )}
        <textarea placeholder="Bio (optional)" {...register(`items.${index}.bio`)} />
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
          {result.ok ? `✓ Created #${result.performerId}` : `✗ ${result.error}`}
        </div>
      )}
    </div>
  );
};

export const AdminPerformersBulkPage = () => {
  const [results, setResults] = useState<BulkPerformerResultRow[] | null>(null);

  const form = useForm<FormValues>({
    resolver: yupResolver(formSchema),
    defaultValues: { items: [EMPTY_ARTIST] },
    mode: 'onSubmit',
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
      const payload = values.items as CreatePerformerPayload[];
      const res = await performersApi.bulkCreate(payload);
      setResults(res.data?.results ?? null);
      toast.success(res.message);
      mutate(['performers']);
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
      <h2>Bulk performers import</h2>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="bulk-summary">
          <span>{fields.length} performer{fields.length === 1 ? '' : 's'}</span>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label className="btn-ghost bulk-json-upload">
              Load JSON
              <input type="file" accept="application/json,.json" onChange={handleJsonFile} hidden />
            </label>
            <button type="button" onClick={() => append(EMPTY_ARTIST)} className="btn-ghost">+ Add row</button>
            <button type="submit" disabled={form.formState.isSubmitting || fields.length === 0}>
              {form.formState.isSubmitting ? 'Creating...' : `Create all (${fields.length})`}
            </button>
          </div>
        </div>

        <div className="bulk-edit-list">
          {fields.map((f, idx) => (
            <PerformerCard
              key={f.id}
              index={idx}
              control={form.control}
              register={form.register}
              setValue={form.setValue}
              remove={() => remove(idx)}
              result={results?.[idx]}
              errors={itemErrors[idx]}
            />
          ))}
        </div>
      </form>
    </div>
  );
};
