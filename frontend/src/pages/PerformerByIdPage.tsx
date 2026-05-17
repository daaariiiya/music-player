import { Link, useParams } from 'react-router-dom';
import { usePerformerById } from '../hooks/usePerformerById';
import { useAlbums } from '../hooks/useAlbums';
import { useSongs } from '../hooks/useSongs';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const PerformerByIdPage = () => {
  const { id } = useParams();
  const performerId = Number(id);
  const { data, isLoading } = usePerformerById(performerId);
  const { data: albums } = useAlbums();
  const { data: songs } = useSongs();

  if (isLoading) return <Spinner />;
  if (!data) return <EmptyState message="Performer not found." />;

  const albumList = (albums ?? []).filter((a) => a.performer_id === performerId);
  const songList = (songs ?? []).filter((s) => s.performer_id === performerId);
  const name = data.artist?.name ?? data.group?.name ?? '';

  return (
    <div>
      <div className="detail-header">
        {data.performer.photo_url ? (
          <img src={data.performer.photo_url} alt={name} className="detail-photo" />
        ) : (
          <div className="detail-photo detail-photo--placeholder">♪</div>
        )}
        <div className="detail-info">
          <h2 style={{ marginBottom: '0.25rem' }}>{name}</h2>
          <div className="detail-chips">
            <span className="card-chip">{data.performer.type}</span>
            <span className="card-chip">{data.performer.genre}</span>
            <span className="card-chip">{data.performer.country}</span>
          </div>
          {data.artist && (
            <>
              <p><small>Born</small> {data.artist.birthday_date}</p>
              <p><small>Career start</small> {data.artist.career_started_date}</p>
              {data.artist.bio && <p className="detail-bio">{data.artist.bio}</p>}
            </>
          )}
          {data.group && (
            <>
              <p><small>Founded</small> {data.group.year_created}</p>
              {data.group.bio && <p className="detail-bio">{data.group.bio}</p>}
            </>
          )}
        </div>
      </div>

      <h3>Albums</h3>
      {albumList.length === 0 ? <EmptyState message="No albums." /> : (
        <div className="card-grid">
          {albumList.map((a) => (
            <Link key={a.album_id} to={`/albums/${a.album_id}`} className="card">
              {a.photo_url ? (
                <img src={a.photo_url} alt={a.title} className="card-thumb" />
              ) : (
                <div className="card-thumb card-thumb--placeholder">♪</div>
              )}
              <div className="card-body">
                <div className="card-title">{a.title}</div>
                <div className="card-meta">{a.release_date}</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <h3>Songs</h3>
      {songList.length === 0 ? <EmptyState message="No songs." /> : (
        <div className="card-grid">
          {songList.map((s) => (
            <Link key={s.song_id} to={`/songs/${s.song_id}`} className="card">
              {s.photo_url ? (
                <img src={s.photo_url} alt={s.title} className="card-thumb" />
              ) : (
                <div className="card-thumb card-thumb--placeholder">♪</div>
              )}
              <div className="card-body">
                <div className="card-title">{s.title}</div>
                <div className="card-meta">{s.album_title ?? ''}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
