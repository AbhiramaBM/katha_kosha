import { Router } from 'express';
import * as storiesController from './stories.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { uploadStoryPdf } from '../../middleware/upload.middleware.js';
import {
  createStorySchema,
  updateStorySchema,
  listStoriesSchema,
  storyIdParamSchema
} from './stories.schema.js';

const router = Router();

// Authentication required for all story routes
router.use(authenticate);

router.post('/', uploadStoryPdf, validate(createStorySchema), storiesController.createStory);
router.get('/', validate(listStoriesSchema), storiesController.listStories);
router.get('/:id', validate(storyIdParamSchema), storiesController.getStory);
router.patch('/:id', uploadStoryPdf, validate(updateStorySchema), storiesController.updateStory);
router.put('/:id/pdf', validate(storyIdParamSchema), uploadStoryPdf, storiesController.replacePdf);

// Soft delete: Admin only!
router.delete('/:id', requireRole('admin'), validate(storyIdParamSchema), storiesController.deleteStory);

export default router;
