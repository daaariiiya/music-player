import { useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { useSongById } from '../hooks/useSongById';
import { usePlaylists } from '../hooks/usePlaylists';
import { playlistsApi } from '../api/playlists.api';
import { useAuthStore } from '../store/auth.store';
import { toast, toastError } from '../utils/toast';
import { formatDuration } from '../utils/format';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const SongByIdPage = () => {
  const { id } = useParams();
  const songId = Number(id);
  const { data, isLoading } = useSongById(songId);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { data: playlists } = usePlaylists();

  const handleAdd = async (playlistId: number) => {
    try {
      await playlistsApi.addSong(playlistId, songId);
      toast.success('Song added.');
      mutate(['playlist', playlistId]);
    } catch (e) {
      toastError(e);
    }
  };

  if (isLoading) return <Spinner />;
  if (!data) return <EmptyState message="Song not found." />;

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
            {data.album_title && <span className="card-chip">{data.album_title}</span>}
            <span className="card-chip">{formatDuration(data.duration_seconds)}</span>
          </div>
          <p><small>Released</small> {data.release_date}</p>
          {data.description && <p className="detail-bio">{data.description}</p>}
        </div>
      </div>

      {isAuthenticated && (
        <>
          <h3>Add to playlist</h3>
          {(playlists ?? []).length === 0 ? (
            <EmptyState message="No playlists yet." />
          ) : (
            <ul>
              {(playlists ?? []).map((p) => (
                <li key={p.playlist_id}>
                  <span style={{ flex: 1 }}>{p.title}</span>
                  <button onClick={() => handleAdd(p.playlist_id)}>Add</button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};
