import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import { storage } from '../../storage/index.js';
import { AppError } from '../../utils/response.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';
import { validateMagicBytes } from '../../utils/magicBytes.js';

export async function createStory(storyData, file, userId) {
  // 1. Validate author exists and is not deleted
  const author = await db('authors')
    .where({ id: storyData.author_id })
    .whereNull('deleted_at')
    .first();

  if (!author) {
    throw new AppError('NOT_FOUND', 'Specified author does not exist or has been deleted', 400);
  }

  // 2. Validate content_type rules
  let pdfUrl = null;
  let pdfKey = null;
  let contentText = null;

  if (storyData.content_type === 'text') {
    if (!storyData.content_text || storyData.content_text.trim() === '') {
      throw new AppError('VALIDATION_ERROR', 'content_text is required when content_type is text', 400);
    }
    contentText = storyData.content_text;
  } else if (storyData.content_type === 'pdf') {
    if (!file || !file.buffer) {
      throw new AppError('VALIDATION_ERROR', 'A book file (PDF, DOCX, EPUB, TXT) is required when content_type is pdf', 400);
    }

    const mime = file.mimetype || 'application/pdf';
    // Magic bytes check
    if (!validateMagicBytes(file.buffer, mime, file.originalname)) {
      throw new AppError('UNSUPPORTED_MEDIA_TYPE', 'Uploaded file is not a valid standard book file (magic bytes check failed)', 415);
    }
  }

  // 3. Insert story first to get ID
  const [storyId] = await db('stories').insert({
    author_id: storyData.author_id,
    title_kn: storyData.title_kn,
    title_en: storyData.title_en || null,
    genre: storyData.genre || null,
    language: storyData.language || 'kn',
    published_year: storyData.published_year || null,
    summary: storyData.summary || null,
    content_type: storyData.content_type,
    content_text: contentText,
    pdf_url: null,
    pdf_key: null,
    status: storyData.status || 'draft',
    created_by: userId,
    updated_by: userId
  });

  // 4. If book file, upload with key stories/<id>/<uuid>.<ext>
  if (storyData.content_type === 'pdf' && file) {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.pdf';
    const filename = `${uuidv4()}${ext}`;
    const key = `stories/${storyId}/${filename}`;
    const { url } = await storage.save({
      key,
      buffer: file.buffer,
      mimeType: file.mimetype || 'application/pdf'
    });

    pdfUrl = url;
    pdfKey = key;

    await db('stories').where({ id: storyId }).update({
      pdf_url: pdfUrl,
      pdf_key: pdfKey
    });
  }

  // 5. Insert references if provided
  if (storyData.references && Array.isArray(storyData.references) && storyData.references.length > 0) {
    const refsToInsert = storyData.references.map((ref, idx) => ({
      story_id: storyId,
      name: ref.name,
      url: ref.url,
      sort_order: ref.sort_order !== undefined ? ref.sort_order : idx
    }));
    await db('story_references').insert(refsToInsert);
  }

  return getStoryById(storyId);
}

export async function listStories(query) {
  const { page, limit, offset } = getPagination(query);

  let qb = db('stories')
    .leftJoin('authors', 'stories.author_id', 'authors.id')
    .whereNull('stories.deleted_at')
    .whereNull('authors.deleted_at');

  if (query.author_id) {
    qb = qb.where('stories.author_id', query.author_id);
  }

  if (query.genre) {
    qb = qb.where('stories.genre', query.genre);
  }

  if (query.status) {
    qb = qb.where('stories.status', query.status);
  }

  if (query.q) {
    const term = `%${query.q.trim()}%`;
    qb = qb.where((builder) => {
      builder.where('stories.title_kn', 'like', term)
             .orWhere('stories.title_en', 'like', term)
             .orWhere('authors.name_kn', 'like', term)
             .orWhere('authors.name_en', 'like', term);
    });
  }

  const countResult = await qb.clone().count('stories.id as count').first();
  const total = parseInt(countResult.count, 10);

  const sortCol = query.sort ? `stories.${query.sort}` : 'stories.created_at';
  const sortOrder = query.sort === 'title_kn' || query.sort === 'title_en' ? 'asc' : 'desc';

  // Return summary fields only (no content_text)
  const stories = await qb
    .select(
      'stories.id',
      'stories.title_kn',
      'stories.title_en',
      'stories.genre',
      'stories.language',
      'stories.published_year',
      'stories.summary',
      'stories.content_type',
      'stories.pdf_url',
      'stories.status',
      'stories.created_at',
      'stories.updated_at',
      'authors.id as author_id',
      'authors.name_kn as author_name_kn',
      'authors.name_en as author_name_en'
    )
    .orderBy(sortCol, sortOrder)
    .limit(limit)
    .offset(offset);

  // Format author object
  const formatted = stories.map((s) => ({
    id: s.id,
    title_kn: s.title_kn,
    title_en: s.title_en,
    genre: s.genre,
    language: s.language,
    published_year: s.published_year,
    summary: s.summary,
    content_type: s.content_type,
    pdf_url: s.pdf_url,
    status: s.status,
    created_at: s.created_at,
    updated_at: s.updated_at,
    author: {
      id: s.author_id,
      name_kn: s.author_name_kn,
      name_en: s.author_name_en
    }
  }));

  return {
    stories: formatted,
    meta: buildMeta(page, limit, total)
  };
}

export async function getStoryById(storyId) {
  const story = await db('stories')
    .where({ id: storyId })
    .whereNull('deleted_at')
    .first();

  if (!story) {
    throw new AppError('NOT_FOUND', 'Story not found', 404);
  }

  const author = await db('authors')
    .select('id', 'name_kn', 'name_en', 'photo_url')
    .where({ id: story.author_id })
    .whereNull('deleted_at')
    .first();

  const references = await db('story_references')
    .select('id', 'name', 'url', 'sort_order')
    .where({ story_id: storyId })
    .orderBy('sort_order', 'asc');

  return {
    id: story.id,
    title_kn: story.title_kn,
    title_en: story.title_en,
    genre: story.genre,
    language: story.language,
    published_year: story.published_year,
    summary: story.summary,
    content_type: story.content_type,
    content_text: story.content_text,
    pdf_url: story.pdf_url,
    status: story.status,
    created_at: story.created_at,
    updated_at: story.updated_at,
    author: author || null,
    references
  };
}

export async function updateStory(storyId, updateData, file, userId) {
  const existing = await db('stories')
    .where({ id: storyId })
    .whereNull('deleted_at')
    .first();

  if (!existing) {
    throw new AppError('NOT_FOUND', 'Story not found', 404);
  }

  // Validate author if provided
  if (updateData.author_id && updateData.author_id !== existing.author_id) {
    const author = await db('authors')
      .where({ id: updateData.author_id })
      .whereNull('deleted_at')
      .first();

    if (!author) {
      throw new AppError('NOT_FOUND', 'Specified author does not exist or has been deleted', 400);
    }
  }

  const updatePayload = {
    updated_by: userId,
    updated_at: db.fn.now()
  };

  if (updateData.author_id !== undefined) updatePayload.author_id = updateData.author_id;
  if (updateData.title_kn !== undefined) updatePayload.title_kn = updateData.title_kn;
  if (updateData.title_en !== undefined) updatePayload.title_en = updateData.title_en;
  if (updateData.genre !== undefined) updatePayload.genre = updateData.genre;
  if (updateData.language !== undefined) updatePayload.language = updateData.language;
  if (updateData.published_year !== undefined) updatePayload.published_year = updateData.published_year;
  if (updateData.summary !== undefined) updatePayload.summary = updateData.summary;
  if (updateData.status !== undefined) updatePayload.status = updateData.status;

  // Handle content_type switching and content update
  const targetContentType = updateData.content_type || existing.content_type;

  if (targetContentType === 'text') {
    updatePayload.content_type = 'text';

    if (updateData.content_text !== undefined) {
      if (!updateData.content_text || updateData.content_text.trim() === '') {
        throw new AppError('VALIDATION_ERROR', 'content_text cannot be empty when content_type is text', 400);
      }
      updatePayload.content_text = updateData.content_text;
    } else if (existing.content_type === 'pdf') {
      // Switching from pdf to text requires content_text
      throw new AppError('VALIDATION_ERROR', 'content_text is required when switching to text content_type', 400);
    }

    // Clear and delete old PDF if switching from PDF
    if (existing.content_type === 'pdf' || existing.pdf_key) {
      if (existing.pdf_key) {
        await storage.delete({ key: existing.pdf_key });
      }
      updatePayload.pdf_url = null;
      updatePayload.pdf_key = null;
    }
  } else if (targetContentType === 'pdf') {
    updatePayload.content_type = 'pdf';
    updatePayload.content_text = null; // Clear text when book file

    // If new file provided, replace book file
    if (file && file.buffer) {
      const mime = file.mimetype || 'application/pdf';
      if (!validateMagicBytes(file.buffer, mime, file.originalname)) {
        throw new AppError('UNSUPPORTED_MEDIA_TYPE', 'Uploaded file is not a valid standard book file (magic bytes check failed)', 415);
      }

      if (existing.pdf_key) {
        await storage.delete({ key: existing.pdf_key });
      }

      const ext = path.extname(file.originalname || '').toLowerCase() || '.pdf';
      const filename = `${uuidv4()}${ext}`;
      const key = `stories/${storyId}/${filename}`;
      const { url } = await storage.save({
        key,
        buffer: file.buffer,
        mimeType: file.mimetype || 'application/pdf'
      });

      updatePayload.pdf_url = url;
      updatePayload.pdf_key = key;
    } else if (existing.content_type === 'text') {
      // Switching from text to pdf without a file
      throw new AppError('VALIDATION_ERROR', 'A standard book file is required when switching to book document format', 400);
    }
  }

  await db('stories').where({ id: storyId }).update(updatePayload);

  // Handle references array replacement (Rule 5)
  if (updateData.references !== undefined) {
    await db('story_references').where({ story_id: storyId }).delete();

    if (Array.isArray(updateData.references) && updateData.references.length > 0) {
      const refsToInsert = updateData.references.map((ref, idx) => ({
        story_id: storyId,
        name: ref.name,
        url: ref.url,
        sort_order: ref.sort_order !== undefined ? ref.sort_order : idx
      }));
      await db('story_references').insert(refsToInsert);
    }
  }

  return getStoryById(storyId);
}

export async function replaceStoryPdf(storyId, file, userId) {
  const story = await db('stories')
    .where({ id: storyId })
    .whereNull('deleted_at')
    .first();

  if (!story) {
    throw new AppError('NOT_FOUND', 'Story not found', 404);
  }

  if (!file || !file.buffer) {
    throw new AppError('VALIDATION_ERROR', 'A book file is required', 400);
  }

  const mime = file.mimetype || 'application/pdf';
  if (!validateMagicBytes(file.buffer, mime, file.originalname)) {
    throw new AppError('UNSUPPORTED_MEDIA_TYPE', 'Uploaded file is not a valid standard book file (magic bytes check failed)', 415);
  }

  // Remove old file if exists
  if (story.pdf_key) {
    await storage.delete({ key: story.pdf_key });
  }

  const ext = path.extname(file.originalname || '').toLowerCase() || '.pdf';
  const filename = `${uuidv4()}${ext}`;
  const key = `stories/${storyId}/${filename}`;
  const { url } = await storage.save({
    key,
    buffer: file.buffer,
    mimeType: file.mimetype || 'application/pdf'
  });

  await db('stories').where({ id: storyId }).update({
    content_type: 'pdf',
    content_text: null,
    pdf_url: url,
    pdf_key: key,
    updated_by: userId,
    updated_at: db.fn.now()
  });

  return {
    pdf_url: url,
    pdf_key: key
  };
}

export async function deleteStory(storyId, userId) {
  const story = await db('stories')
    .where({ id: storyId })
    .whereNull('deleted_at')
    .first();

  if (!story) {
    throw new AppError('NOT_FOUND', 'Story not found', 404);
  }

  // Soft delete
  await db('stories').where({ id: storyId }).update({
    deleted_at: db.fn.now(),
    updated_by: userId,
    updated_at: db.fn.now()
  });
}
