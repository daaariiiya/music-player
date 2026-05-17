import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { ValidationError } from 'yup';
import { AppError } from '../utils/errors.js';
import { apiError } from '../utils/response.js';
import { env } from '../config/env.js';

/**
 * Global Hono onError handler.
 * Maps AppError subclasses, Yup ValidationError, and HTTPException to a uniform JSON response.
 */
export const errorHandler = (err: Error, c: Context): Response => {
  if (err instanceof AppError) {
    return c.json(apiError(err.message), err.statusCode as 400 | 401 | 403 | 404 | 409 | 500);
  }

  if (err instanceof ValidationError) {
    return c.json(apiError('Validation failed.', err.inner.length ? err.inner : [err]), 400);
  }

  if (err instanceof HTTPException) {
    return c.json(apiError(err.message || 'Request failed.'), err.status);
  }

  console.error('[unhandled]', err);
  const message = env.NODE_ENV === 'production' ? 'Internal server error.' : err.message;
  return c.json(apiError(message), 500);
};
