import { Link } from 'react-router-dom';
import { usePerformers } from '../hooks/usePerformers';
import { useAlbums } from '../hooks/useAlbums';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const HomePage = () => {
  const { data: performers, isLoading: pLoading } = usePerformers();
  const { data: albums, isLoading: aLoading } = useAlbums();
  if (pLoading || aLoading) return <Spinner />;

  const featured = (performers ?? []).slice(0, 6);
  const recent = (albums ?? [])
    .slice()
    .sort((a, b) => (b.release_date > a.release_date ? 1 : -1))
    .slice(0, 6);

  return (
    <div>
      <h2>Featured performers</h2>
      {featured.length === 0 ? (
        <EmptyState message="No performers yet." />
      ) : (
        <div className="card-grid">
          {featured.map((p) => (
            <Link key={p.performer_id} to={`/performers/${p.performer_id}`} className="card">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="card-thumb" />
              ) : (
                <div className="card-thumb card-thumb--placeholder">♪</div>
              )}
              <div className="card-body">
                <div className="card-title">{p.name}</div>
                <div className="card-meta">{p.genre}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h3 style={{ marginTop: '2rem' }}>Recent albums</h3>
      {recent.length === 0 ? (
        <EmptyState message="No albums yet." />
      ) : (
        <div className="card-grid">
          {recent.map((a) => (
            <Link key={a.album_id} to={`/albums/${a.album_id}`} className="card">
              {a.photo_url ? (
                <img src={a.photo_url} alt={a.title} className="card-thumb" />
              ) : (
                <div className="card-thumb card-thumb--placeholder">♪</div>
              )}
              <div className="card-body">
                <div className="card-title">{a.title}</div>
                <div className="card-meta">{a.performer_name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
