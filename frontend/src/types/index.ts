export type Role = 'user' | 'admin';
export type PerformerType = 'artist' | 'group';

export interface User {
  userId: number;
  username: string;
  email: string;
  role: Role;
  verified: boolean;
}

export interface Performer {
  performer_id: number;
  type: PerformerType;
  genre: string;
  country: string;
  photo_url: string | null;
  name: string;
}

export interface PerformerDetail {
  performer: {
    performer_id: number;
    type: PerformerType;
    genre: string;
    country: string;
    photo_id: number | null;
    photo_url: string | null;
    created_at: string | null;
  };
  artist: Artist | null;
  group: MusicGroup | null;
}

export interface Artist {
  artist_id: number;
  performer_id: number;
  name: string;
  birthday_date: string;
  bio: string | null;
  career_started_date: string;
}

export interface MusicGroup {
  group_id: number;
  performer_id: number;
  name: string;
  year_created: number;
  bio: string | null;
}

export interface GroupMember {
  artist_id: number;
  performer_id: number;
  name: string;
  birthday_date: string;
  start_date: string;
  end_date: string | null;
}

export interface GroupWithMembers {
  group_id: number;
  performer_id: number;
  name: string;
  year_created: number;
  members: Array<{
    artist_id: number;
    name: string;
    start_date: string;
    end_date: string | null;
  }>;
}

export interface Album {
  album_id: number;
  title: string;
  description?: string | null;
  release_date: string;
  performer_id: number;
  performer_name: string;
  photo_url: string | null;
}

export interface AlbumDetail extends Album {
  songs: Array<{
    song_id: number;
    title: string;
    duration_seconds: number;
    release_date: string;
  }>;
}

export interface Song {
  song_id: number;
  title: string;
  description?: string | null;
  release_date: string;
  duration_seconds: number;
  performer_id: number;
  performer_name: string;
  album_id: number | null;
  album_title: string | null;
  photo_url: string | null;
}

export type SongDetail = Song;

export interface Playlist {
  playlist_id: number;
  user_id: number;
  title: string;
  description: string | null;
  created_at: string | null;
}

export interface PlaylistWithSongs extends Playlist {
  songs: Array<{
    song_id: number;
    title: string;
    duration_seconds: number;
    release_date: string;
    added_at: string | null;
  }>;
}

export interface TopSongRow {
  song_id: number;
  title: string;
  add_count: number;
}

export interface GenrePopularityRow {
  genre: string;
  playlist_count: number;
}

export interface UserPreferences {
  artist: { count: number; share: number };
  group: { count: number; share: number };
  total: number;
}

export interface Statistics {
  top_songs: TopSongRow[];
  popular_genres: GenrePopularityRow[];
  user_preferences: UserPreferences;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ path?: string; message: string }>;
}
