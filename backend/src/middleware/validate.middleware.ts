// Pattern: Strategy
import type { Context, Next, MiddlewareHandler } from 'hono';
import * as yup from 'yup';
import { apiError } from '../utils/response.js';

type Source = 'body' | 'query' | 'param';

const FIELD_LABELS: Record<string, string> = {
  type: 'Type',
  name: 'Name',
  title: 'Title',
  genre: 'Genre',
  country: 'Country',
  bio: 'Bio',
  description: 'Description',
  email: 'Email',
  username: 'Username',
  password: 'Password',
  token: 'Token',
  birthday_date: 'Birthday',
  career_started_date: 'Career start date',
  release_date: 'Release date',
  year_created: 'Year created',
  start_date: 'Start date',
  end_date: 'End date',
  duration_seconds: 'Duration (seconds)',
  performer_id: 'Performer',
  album_id: 'Album',
  song_id: 'Song',
  artist_id: 'Artist',
  group_id: 'Group',
  playlist_id: 'Playlist',
  photo_id: 'Photo',
  photoId: 'Photo',
  user_id: 'User',
  role: 'Role',
  items: 'Items',
  album: 'Album',
  songs: 'Songs',
};

/**
 * Converts a Yup path (e.g. "items[0].album.performer_id") into a friendly user-facing path.
 * Bracket indices kept as-is; field segments mapped via FIELD_LABELS.
 */
const humanizePath = (path: string | undefined): string | undefined => {
  if (!path) return path;
  return path
    .split('.')
    .map((segment) => {
      // split off trailing [N] indices
      const match = segment.match(/^([^[]+)(\[\d+\])?$/);
      if (!match) return segment;
      const [, field, idx = ''] = match;
      const friendly = FIELD_LABELS[field] ?? field;
      return `${friendly}${idx}`;
    })
    .join(' → ');
};

const humanizeMessage = (message: string): string =>
  message.replace(/\b(performer_id|album_id|song_id|artist_id|group_id|playlist_id|user_id|photo_id|birthday_date|career_started_date|release_date|year_created|duration_seconds|start_date|end_date)\b/g, (m) => FIELD_LABELS[m] ?? m);

/**
 * Builds a validation middleware that runs a Yup schema against a request source.
 * Validated value is stored on context under the same key (`body` | `query` | `param`).
 * @param schema - Yup schema (Strategy)
 * @param source - where to read input from (default: 'body')
 */
export const validate = <T extends yup.AnyObject>(
  schema: yup.ObjectSchema<T>,
  source: Source = 'body'
): MiddlewareHandler => {
  return async (c: Context, next: Next) => {
    let input: unknown;
    try {
      if (source === 'body') {
        input = await c.req.json().catch(() => ({}));
      } else if (source === 'query') {
        input = c.req.query();
      } else {
        input = c.req.param();
      }

      const validated = await schema.validate(input, { abortEarly: false, stripUnknown: true });
      c.set(source, validated);
      await next();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        const list = err.inner.length ? err.inner : [err];
        return c.json(
          apiError(
            'Validation failed.',
            list.map((e) => ({ path: humanizePath(e.path), message: humanizeMessage(e.message) }))
          ),
          400
        );
      }
      throw err;
    }
  };
};
