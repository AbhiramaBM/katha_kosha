import { Router } from 'express';
import * as usersController from './users.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';
import { createUserSchema, updateUserSchema, resetPasswordSchema, listUsersSchema } from './users.schema.js';

const router = Router();

// All routes require Admin role
router.use(authenticate, requireRole('admin'));

router.post('/', validate(createUserSchema), usersController.createUser);
router.get('/', validate(listUsersSchema), usersController.listUsers);
router.patch('/:id', validate(updateUserSchema), usersController.updateUser);
router.post('/:id/reset-password', validate(resetPasswordSchema), usersController.resetPassword);

export default router;
