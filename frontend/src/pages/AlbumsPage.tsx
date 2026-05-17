import { Link } from 'react-router-dom';
import { useAlbums } from '../hooks/useAlbums';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const AlbumsPage = () => {
  const { data, isLoading } = useAlbums();
  if (isLoading) return <Spinner />;
  const items = data ?? [];

  return (
    <div>
      <h2>Albums</h2>
      {items.length === 0 ? (
        <EmptyState message="No albums yet." />
      ) : (
        <div className="card-grid">
          {items.map((a) => (
            <Link key={a.album_id} to={`/albums/${a.album_id}`} className="card">
              {a.photo_url ? (
                <img src={a.photo_url} alt={a.title} className="card-thumb" />
              ) : (
                <div className="card-thumb card-thumb--placeholder">♪</div>
              )}
              <div className="card-body">
                <div className="card-title">{a.title}</div>
                <div className="card-meta">{a.performer_name}</div>
                <div className="card-meta">{a.release_date}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
