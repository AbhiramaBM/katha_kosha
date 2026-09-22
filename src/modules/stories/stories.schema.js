import { z } from 'zod';

const referenceSchema = z.object({
  name: z.string().min(1, 'Reference name is required').max(190),
  url: z.string().url('Reference URL must be a valid HTTP(S) URL').max(1000),
  sort_order: z.number().int().optional().default(0)
});

export const createStorySchema = {
  body: z.object({
    author_id: z.coerce.number().int().positive('author_id is required and must be positive'),
    title_kn: z.string().min(1, 'title_kn is required').max(255),
    title_en: z.string().max(255).optional().nullable(),
    genre: z.string().max(100).optional().nullable(),
    language: z.string().max(10).default('kn'),
    published_year: z.coerce.number().int().min(1).max(2100).optional().nullable(),
    summary: z.string().optional().nullable(),
    content_type: z.enum(['text', 'pdf']),
    content_text: z.string().optional().nullable(),
    status: z.enum(['draft', 'published']).default('draft'),
    references: z.union([
      z.array(referenceSchema),
      z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val);
          if (!Array.isArray(parsed)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'references must be an array' });
            return [];
          }
          return parsed;
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'references must be valid JSON' });
          return [];
        }
      })
    ]).optional().default([])
  }).superRefine((data, ctx) => {
    if (data.references && data.references.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['references'],
        message: 'A story can have a maximum of 20 references'
      });
    }

    if (data.content_type === 'text') {
      if (!data.content_text || data.content_text.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content_text'],
          message: 'content_text is required when content_type is text'
        });
      }
    }
  })
};

export const updateStorySchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Story ID must be an integer')
  }),
  body: z.object({
    author_id: z.coerce.number().int().positive().optional(),
    title_kn: z.string().min(1).max(255).optional(),
    title_en: z.string().max(255).optional().nullable(),
    genre: z.string().max(100).optional().nullable(),
    language: z.string().max(10).optional(),
    published_year: z.coerce.number().int().min(1).max(2100).optional().nullable(),
    summary: z.string().optional().nullable(),
    content_type: z.enum(['text', 'pdf']).optional(),
    content_text: z.string().optional().nullable(),
    status: z.enum(['draft', 'published']).optional(),
    references: z.union([
      z.array(referenceSchema),
      z.string().transform((val, ctx) => {
        try {
          const parsed = JSON.parse(val);
          if (!Array.isArray(parsed)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'references must be an array' });
            return [];
          }
          return parsed;
        } catch {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'references must be valid JSON' });
          return [];
        }
      })
    ]).optional()
  }).superRefine((data, ctx) => {
    if (data.references && data.references.length > 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['references'],
        message: 'A story can have a maximum of 20 references'
      });
    }

    if (data.content_type === 'text') {
      if (!data.content_text || data.content_text.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['content_text'],
          message: 'content_text is required when content_type is text'
        });
      }
    }
  })
};

export const listStoriesSchema = {
  query: z.object({
    q: z.string().optional(),
    author_id: z.string().optional(),
    genre: z.string().optional(),
    status: z.enum(['draft', 'published']).optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    sort: z.enum(['title_kn', 'title_en', 'published_year', 'created_at', 'updated_at']).optional()
  })
};

export const storyIdParamSchema = {
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Story ID must be an integer')
  })
};
