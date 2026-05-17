import type { Context, Next, MiddlewareHandler } from 'hono';
import { ForbiddenError } from '../utils/errors.js';

/**
 * Hono middleware: requires authenticated user to have role 'admin'.
 * MUST run AFTER `requireAuth` (depends on c.get('role')).
 */
export const requireAdmin: MiddlewareHandler = async (c: Context, next: Next) => {
  const role = c.get('role') as string | undefined;
  if (role !== 'admin') throw new ForbiddenError('Admin role required.');
  await next();
};
