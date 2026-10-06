import { Router } from 'express';
import * as authorsController from './authors.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { uploadAuthorPhoto } from '../../middleware/upload.middleware.js';
import {
  createAuthorSchema,
  updateAuthorSchema,
  listAuthorsSchema,
  authorIdParamSchema
} from './authors.schema.js';

const router = Router();

// Authentication required for all author routes
router.use(authenticate);

// Only admin and editor can create or modify authors
router.post('/', requireRole('admin', 'editor'), validate(createAuthorSchema), authorsController.createAuthor);
router.get('/', validate(listAuthorsSchema), authorsController.listAuthors);
router.get('/:id', validate(authorIdParamSchema), authorsController.getAuthor);
router.patch('/:id', requireRole('admin', 'editor'), validate(updateAuthorSchema), authorsController.updateAuthor);
router.post('/:id/photo', requireRole('admin', 'editor'), validate(authorIdParamSchema), uploadAuthorPhoto, authorsController.uploadPhoto);
router.get('/:id/stories', validate(authorIdParamSchema), authorsController.getStories);

// Soft delete: Admin only!
router.delete('/:id', requireRole('admin'), validate(authorIdParamSchema), authorsController.deleteAuthor);

export default router;
