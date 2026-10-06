import { z } from 'zod';
import { passwordRegex } from '../auth/auth.schema.js';

export const createUserSchema = {
  body: z.object({
    name: z.string().min(1, 'Name is required').max(120),
    email: z.string().email('Valid email is required').max(190),
    password: z.string().regex(passwordRegex, 'Password must be at least 8 characters and contain at least 1 letter and 1 number'),
    role: z.enum(['admin', 'editor', 'user']).default('user')
  })
};

export const updateUserSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  }),
  body: z.object({
    name: z.string().min(1).max(120).optional(),
    role: z.enum(['admin', 'editor', 'user']).optional(),
    is_active: z.boolean().optional()
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field (name, role, is_active) must be provided'
  })
};

export const resetPasswordSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be an integer')
  }),
  body: z.object({
    password: z.string().regex(passwordRegex, 'Password must be at least 8 characters and contain at least 1 letter and 1 number')
  })
};

export const listUsersSchema = {
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional()
  })
};
