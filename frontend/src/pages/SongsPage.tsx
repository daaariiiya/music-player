import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSongs } from '../hooks/useSongs';
import { formatDuration } from '../utils/format';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

const PAGE_SIZE = 24;

export const SongsPage = () => {
  const { data, isLoading } = useSongs();
  const [page, setPage] = useState(1);

  const total = data?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const slice = useMemo(
    () => (data ?? []).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [data, page]
  );

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2>Songs</h2>
      {total === 0 ? (
        <EmptyState message="No songs yet." />
      ) : (
        <>
          <div className="card-grid">
            {slice.map((s) => (
              <Link key={s.song_id} to={`/songs/${s.song_id}`} className="card">
                {s.photo_url ? (
                  <img src={s.photo_url} alt={s.title} className="card-thumb" />
                ) : (
                  <div className="card-thumb card-thumb--placeholder">♪</div>
                )}
                <div className="card-body">
                  <div className="card-title">{s.title}</div>
                  <div className="card-meta">{s.performer_name}</div>
                  <div className="card-meta">
                    {s.album_title ? `${s.album_title} · ` : ''}
                    {formatDuration(s.duration_seconds)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="filter-bar" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
            <span style={{ alignSelf: 'center', color: 'var(--muted)' }}>Page {page} / {pageCount}</span>
            <button onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={page >= pageCount}>Next</button>
          </div>
        </>
      )}
    </div>
  );
};
