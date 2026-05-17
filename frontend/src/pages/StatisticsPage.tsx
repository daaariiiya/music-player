import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useStatistics } from '../hooks/useStatistics';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';

const COLORS = ['#a766ff', '#f59e0b'];

export const StatisticsPage = () => {
  const { data, isLoading } = useStatistics();

  if (isLoading || !data) return <Spinner />;

  const prefPie = [
    { name: 'Artists', value: data.user_preferences.artist.count },
    { name: 'Groups', value: data.user_preferences.group.count },
  ];

  const hasTop = data.top_songs.length > 0;
  const hasGenres = data.popular_genres.length > 0;
  const hasPrefs = data.user_preferences.total > 0;
  const nothing = !hasTop && !hasGenres && !hasPrefs;

  return (
    <div>
      <h2>Statistics</h2>

      {nothing && <EmptyState message="No statistics yet. Add songs to playlists to generate data." />}

      {!nothing && (
        <>
          <section>
            <h3>Top songs</h3>
            {hasTop ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.top_songs.map((s) => ({ ...s, add_count: Number(s.add_count) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="title" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="add_count" fill="#a766ff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No songs in any playlist yet." />
            )}
          </section>

          <section>
            <h3>Popular genres</h3>
            {hasGenres ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.popular_genres.map((g) => ({ ...g, playlist_count: Number(g.playlist_count) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="genre" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="playlist_count" fill="#d1afff" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No genre data yet." />
            )}
          </section>

          <section>
            <h3>User preferences (artist vs group)</h3>
            {hasPrefs ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={prefPie} dataKey="value" nameKey="name" outerRadius={100} label>
                    {prefPie.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState message="No preference data yet." />
            )}
          </section>
        </>
      )}
    </div>
  );
};
