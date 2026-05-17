import { Link, useParams } from 'react-router-dom';
import { mutate } from 'swr';
import { usePlaylistById } from '../hooks/usePlaylistById';
import { playlistsApi } from '../api/playlists.api';
import { toast, toastError } from '../utils/toast';
import { formatDuration } from '../utils/format';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

export const PlaylistByIdPage = () => {
  const { id } = useParams();
  const playlistId = Number(id);
  const { data, isLoading } = usePlaylistById(playlistId);

  const handleRemove = async (songId: number) => {
    try {
      await playlistsApi.removeSong(playlistId, songId);
      toast.success('Song removed.');
      mutate(['playlist', playlistId]);
    } catch (e) {
      toastError(e);
    }
  };

  if (isLoading) return <Spinner />;
  if (!data) return <EmptyState message="Playlist not found." />;

  return (
    <div>
      <h2>{data.title}</h2>
      {data.description && <p>{data.description}</p>}

      <h3>Songs</h3>
      {data.songs.length === 0 ? (
        <EmptyState message="No songs yet." />
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {data.songs.map((s) => (
            <li key={s.song_id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <Link to={`/songs/${s.song_id}`}>{s.title}</Link>
              <small style={{ marginLeft: '0.5rem' }}>· {formatDuration(s.duration_seconds)}</small>
              <button onClick={() => handleRemove(s.song_id)} style={{ marginLeft: '0.5rem' }}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
