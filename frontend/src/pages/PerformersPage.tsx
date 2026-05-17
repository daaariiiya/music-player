import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePerformers } from '../hooks/usePerformers';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const PerformersPage = () => {
  const { data, isLoading } = usePerformers();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'' | 'artist' | 'group'>('');

  const filtered = useMemo(() => {
    const list = data ?? [];
    return list.filter((p) => {
      const q = query.toLowerCase();
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.genre.toLowerCase().includes(q);
      const matchT = !typeFilter || p.type === typeFilter;
      return matchQ && matchT;
    });
  }, [data, query, typeFilter]);

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h2>Performers</h2>
      <div className="filter-bar">
        <input placeholder="Search name or genre" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as '' | 'artist' | 'group')}>
          <option value="">All types</option>
          <option value="artist">Artists</option>
          <option value="group">Groups</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState message="No performers match." />
      ) : (
        <div className="card-grid">
          {filtered.map((p) => (
            <Link key={p.performer_id} to={`/performers/${p.performer_id}`} className="card">
              {p.photo_url ? (
                <img src={p.photo_url} alt={p.name} className="card-thumb" />
              ) : (
                <div className="card-thumb card-thumb--placeholder">♪</div>
              )}
              <div className="card-body">
                <div className="card-title">{p.name}</div>
                <div className="card-meta">{p.genre} · {p.country}</div>
                <span className="card-chip">{p.type}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
