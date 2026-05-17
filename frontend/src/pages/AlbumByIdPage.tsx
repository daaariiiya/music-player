import { Link, useNavigate, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { useAlbumById } from '../hooks/useAlbumById';
import { useAuthStore } from '../store/auth.store';
import { albumsApi } from '../api/albums.api';
import { toast, toastError } from '../utils/toast';
import { formatDuration } from '../utils/format';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const AlbumByIdPage = () => {
  const { id } = useParams();
  const albumId = Number(id);
  const { data, isLoading } = useAlbumById(albumId);
  const isAdmin = useAuthStore((s) => s.role === 'admin');
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!confirm('Delete this album? Songs lose their album link.')) return;
    try {
      await albumsApi.remove(albumId);
      toast.success('Album deleted.');
      mutate(['albums']);
      navigate('/albums');
    } catch (e) {
      toastError(e);
    }
  };

  if (isLoading) return <Spinner />;
  if (!data) return <EmptyState message="Album not found." />;

  return (
    <div>
      <div className="detail-header">
        {data.photo_url ? (
          <img src={data.photo_url} alt={data.title} className="detail-photo" />
        ) : (
          <div className="detail-photo detail-photo--placeholder">♪</div>
        )}
        <div className="detail-info">
          <div className="detail-title-row">
            <h2 style={{ marginBottom: '0.25rem' }}>{data.title}</h2>
            {isAdmin && (
              <div className="detail-actions">
                <Link to={`/admin/albums/${albumId}/edit`} className="btn-edit">Edit</Link>
                <button type="button" onClick={handleDelete} className="btn-delete">Delete</button>
              </div>
            )}
          </div>
          <div className="detail-chips">
            <span className="card-chip">{data.performer_name}</span>
            <span className="card-chip">{data.release_date}</span>
          </div>
          {data.description && <p className="detail-bio">{data.description}</p>}
        </div>
      </div>

      <h3>Songs</h3>
      {data.songs.length === 0 ? (
        <EmptyState message="No songs in this album." />
      ) : (
        <ol>
          {data.songs.map((s, idx) => (
            <li key={s.song_id}>
              <span style={{ color: 'var(--muted)', minWidth: 24 }}>{idx + 1}</span>
              <Link to={`/songs/${s.song_id}`}>{s.title}</Link>
              <small>{formatDuration(s.duration_seconds)}</small>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
