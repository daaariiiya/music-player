import useSWR from 'swr';
import { authApi } from '../api/auth.api';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { usePlaylists } from '../hooks/usePlaylists';

export const ProfilePage = () => {
  const { data, isLoading } = useSWR(['me'], () => authApi.me().then((r) => r.data?.user), {
    revalidateOnFocus: false,
  });
  const { data: playlists } = usePlaylists();

  if (isLoading) return <Spinner />;
  if (!data) return <EmptyState message="Failed to load profile." />;

  const initials = data.username
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar" aria-hidden>{initials || '?'}</div>
        <div className="profile-identity">
          <h2 className="profile-name">{data.username}</h2>
          <div className="profile-email">{data.email}</div>
          <div className="profile-chips">
            <span className={`card-chip ${data.role === 'admin' ? 'chip-admin' : ''}`}>{data.role}</span>
            <span className={`card-chip ${data.verified ? 'chip-ok' : 'chip-warn'}`}>
              {data.verified ? '✓ Verified' : '! Unverified'}
            </span>
          </div>
        </div>
      </div>

      <div className="profile-stats">
        <div className="profile-stat">
          <div className="profile-stat-label">User ID</div>
          <div className="profile-stat-value">#{data.userId}</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-label">Playlists</div>
          <div className="profile-stat-value">{playlists?.length ?? 0}</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-label">Role</div>
          <div className="profile-stat-value">{data.role}</div>
        </div>
        <div className="profile-stat">
          <div className="profile-stat-label">Email status</div>
          <div className="profile-stat-value">{data.verified ? 'Verified' : 'Pending'}</div>
        </div>
      </div>
    </div>
  );
};
