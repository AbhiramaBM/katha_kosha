import { z } from 'zod';

export const createAuthorSchema = {
  body: z.object({
    name_kn: z.string().min(1, 'Kannada name (name_kn) is required').max(190),
    name_en: z.string().max(190).optional().nullable(),
    bio: z.string().optional().nullable(),
    birth_year: z.number().int().min(1).max(2100).optional().nullable(),
    death_year: z.number().int().min(1).max(2100).optional().nullable(),
    place: z.string().max(190).optional().nullable()
  })
};

export const updateAuthorSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Author ID must be an integer')
  }),
  body: z.object({
    name_kn: z.string().min(1).max(190).optional(),
    name_en: z.string().max(190).optional().nullable(),
    bio: z.string().optional().nullable(),
    birth_year: z.number().int().min(1).max(2100).optional().nullable(),
    death_year: z.number().int().min(1).max(2100).optional().nullable(),
    place: z.string().max(190).optional().nullable()
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field to update must be provided'
  })
};

export const listAuthorsSchema = {
  query: z.object({
    q: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(['name_kn', 'name_en', 'created_at', 'birth_year']).optional()
  })
};

export const authorIdParamSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Author ID must be an integer')
  })
};
