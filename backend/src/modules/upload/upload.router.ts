import { Hono } from 'hono';
import { requireAuth } from '../../middleware/auth.middleware.js';
import * as uploadController from './upload.controller.js';

export const uploadRouter = new Hono();

uploadRouter.post('/', requireAuth, uploadController.uploadPhoto);
