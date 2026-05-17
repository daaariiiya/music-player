// Pattern: Chain of Responsibility
import type { Context, Next, MiddlewareHandler } from 'hono';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export interface AccessTokenPayload {
  userId: number;
  role: 'user' | 'admin';
}

/**
 * Hono middleware: parses Bearer token, sets `userId` and `role` on context.
 * Throws UnauthorizedError if token missing/invalid/expired.
 */
export const requireAuth: MiddlewareHandler = async (c: Context, next: Next) => {
  const header = c.req.header('Authorization');
  if (!header || !header.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid Authorization header.');
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) throw new UnauthorizedError('Missing access token.');

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
    c.set('userId', payload.userId);
    c.set('role', payload.role);
    await next();
  } catch {
    throw new UnauthorizedError('Invalid or expired access token.');
  }
};
