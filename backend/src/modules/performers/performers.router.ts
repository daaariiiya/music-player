import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/admin.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as ctrl from './performers.controller.js';
import { bulkCreatePerformersSchema, createPerformerSchema, updatePerformerSchema } from './performers.schema.js';

export const performersRouter = new Hono();

performersRouter.get('/', ctrl.list);
performersRouter.get('/:id', ctrl.getOne);
performersRouter.get('/:id/groups', ctrl.groupsForArtist);
performersRouter.get('/:id/members', ctrl.membersForGroup);

performersRouter.post('/', requireAuth, requireAdmin, validate(createPerformerSchema), ctrl.create);
performersRouter.post('/bulk', requireAuth, requireAdmin, validate(bulkCreatePerformersSchema), ctrl.bulkCreate);
performersRouter.put('/:id', requireAuth, requireAdmin, validate(updatePerformerSchema), ctrl.update);
performersRouter.delete('/:id', requireAuth, requireAdmin, ctrl.remove);
