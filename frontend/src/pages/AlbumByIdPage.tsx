import { Link, useParams } from 'react-router-dom';
import { useAlbumById } from '../hooks/useAlbumById';
import { formatDuration } from '../utils/format';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const AlbumByIdPage = () => {
  const { id } = useParams();
  const { data, isLoading } = useAlbumById(Number(id));

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
          <h2 style={{ marginBottom: '0.25rem' }}>{data.title}</h2>
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
