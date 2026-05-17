import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as ctrl from './groups.controller.js';
import { addMemberSchema } from './groups.schema.js';

export const groupsRouter = new Hono();

groupsRouter.get('/', ctrl.list);
groupsRouter.post(
  '/:groupId/members',
  requireAuth,
  requireAdmin,
  validate(addMemberSchema),
  ctrl.addMember
);
groupsRouter.delete(
  '/:groupId/members/:artistId',
  requireAuth,
  requireAdmin,
  ctrl.removeMember
);
