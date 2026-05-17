import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { mutate } from 'swr';
import { usePlaylists } from '../hooks/usePlaylists';
import { playlistsApi } from '../api/playlists.api';
import { toast, toastError } from '../utils/toast';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

const schema = yup.object({
  title: yup.string().trim().min(1).max(200).label('Title').required(),
  description: yup.string().trim().max(2000).label('Description').optional(),
});
type FormValues = yup.InferType<typeof schema>;

export const PlaylistsPage = () => {
  const { data, isLoading } = usePlaylists();
  const form = useForm<FormValues>({ resolver: yupResolver(schema) });

  const onCreate = form.handleSubmit(async (values) => {
    try {
      await playlistsApi.create(values);
      toast.success('Playlist created.');
      form.reset();
      mutate(['playlists']);
    } catch (e) {
      toastError(e);
    }
  });

  const handleDelete = async (id: number) => {
    try {
      await playlistsApi.remove(id);
      toast.success('Playlist deleted.');
      mutate(['playlists']);
    } catch (e) {
      toastError(e);
    }
  };

  return (
    <div>
      <h2>Your playlists</h2>
      <form onSubmit={onCreate} className="filter-bar">
        <input placeholder="Title" {...form.register('title')} />
        <input placeholder="Description (optional)" {...form.register('description')} />
        <button type="submit" disabled={form.formState.isSubmitting}>Create</button>
      </form>

      {isLoading ? (
        <Spinner />
      ) : (data ?? []).length === 0 ? (
        <EmptyState message="No playlists yet." />
      ) : (
        <div className="card-grid">
          {(data ?? []).map((p) => (
            <div key={p.playlist_id} className="card">
              <Link to={`/playlists/${p.playlist_id}`} className="card-thumb card-thumb--placeholder">
                ♫
              </Link>
              <div className="card-body">
                <Link to={`/playlists/${p.playlist_id}`} className="card-title" style={{ textDecoration: 'none' }}>
                  {p.title}
                </Link>
                {p.description && <div className="card-meta">{p.description}</div>}
              </div>
              <div className="card-actions">
                <button onClick={() => handleDelete(p.playlist_id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
