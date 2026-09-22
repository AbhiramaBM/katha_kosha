import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import { storage } from '../../storage/index.js';
import { AppError } from '../../utils/response.js';
import { getPagination, buildMeta } from '../../utils/pagination.js';
import { validateMagicBytes } from '../../utils/magicBytes.js';

export async function createAuthor(authorData, userId) {
  const payload = {
    name_kn: authorData.name_kn,
    name_en: authorData.name_en || null,
    bio: authorData.bio || null,
    birth_year: authorData.birth_year || null,
    death_year: authorData.death_year || null,
    place: authorData.place || null,
    created_by: userId,
    updated_by: userId
  };

  const [id] = await db('authors').insert(payload);
  const author = await db('authors').where({ id }).first();
  return author;
}

export async function listAuthors(query) {
  const { page, limit, offset } = getPagination(query);

  let qb = db('authors').whereNull('deleted_at');

  if (query.q) {
    const term = `%${query.q.trim()}%`;
    qb = qb.where((builder) => {
      builder.where('name_kn', 'like', term)
             .orWhere('name_en', 'like', term)
             .orWhere('place', 'like', term);
    });
  }

  const countResult = await qb.clone().count('* as count').first();
  const total = parseInt(countResult.count, 10);

  const sortCol = query.sort || 'created_at';
  const sortOrder = sortCol === 'name_kn' || sortCol === 'name_en' ? 'asc' : 'desc';

  const authors = await qb
    .select(
      'id', 'name_kn', 'name_en', 'bio', 'photo_url', 'birth_year', 'death_year',
      'place', 'created_at', 'updated_at'
    )
    .orderBy(sortCol, sortOrder)
    .limit(limit)
    .offset(offset);

  return {
    authors,
    meta: buildMeta(page, limit, total)
  };
}

export async function getAuthorById(authorId) {
  const author = await db('authors')
    .where({ id: authorId })
    .whereNull('deleted_at')
    .first();

  if (!author) {
    throw new AppError('NOT_FOUND', 'Author not found', 404);
  }

  // Count active stories
  const storyCountResult = await db('stories')
    .where({ author_id: authorId })
    .whereNull('deleted_at')
    .count('* as count')
    .first();

  const story_count = parseInt(storyCountResult.count, 10);

  return {
    ...author,
    story_count
  };
}

export async function updateAuthor(authorId, authorData, userId) {
  const author = await db('authors')
    .where({ id: authorId })
    .whereNull('deleted_at')
    .first();

  if (!author) {
    throw new AppError('NOT_FOUND', 'Author not found', 404);
  }

  const updatePayload = {
    updated_by: userId,
    updated_at: db.fn.now()
  };

  if (authorData.name_kn !== undefined) updatePayload.name_kn = authorData.name_kn;
  if (authorData.name_en !== undefined) updatePayload.name_en = authorData.name_en;
  if (authorData.bio !== undefined) updatePayload.bio = authorData.bio;
  if (authorData.birth_year !== undefined) updatePayload.birth_year = authorData.birth_year;
  if (authorData.death_year !== undefined) updatePayload.death_year = authorData.death_year;
  if (authorData.place !== undefined) updatePayload.place = authorData.place;

  await db('authors').where({ id: authorId }).update(updatePayload);

  return getAuthorById(authorId);
}

export async function uploadAuthorPhoto(authorId, file, userId) {
  const author = await db('authors')
    .where({ id: authorId })
    .whereNull('deleted_at')
    .first();

  if (!author) {
    throw new AppError('NOT_FOUND', 'Author not found', 404);
  }

  if (!file || !file.buffer) {
    throw new AppError('VALIDATION_ERROR', 'Photo file is required', 400);
  }

  // Magic bytes check
  const isValidMagic = validateMagicBytes(file.buffer, file.mimetype);
  if (!isValidMagic) {
    throw new AppError('UNSUPPORTED_MEDIA_TYPE', 'File content does not match allowed image formats (magic bytes check failed)', 415);
  }

  // Remove old photo if exists
  if (author.photo_key) {
    await storage.delete({ key: author.photo_key });
  }

  // Determine extension
  const ext = file.mimetype === 'image/jpeg' ? 'jpg' : (file.mimetype === 'image/png' ? 'png' : 'webp');
  const filename = `${uuidv4()}.${ext}`;
  const key = `authors/${authorId}/${filename}`;

  const { url } = await storage.save({
    key,
    buffer: file.buffer,
    mimeType: file.mimetype
  });

  await db('authors').where({ id: authorId }).update({
    photo_url: url,
    photo_key: key,
    updated_by: userId,
    updated_at: db.fn.now()
  });

  return {
    photo_url: url,
    photo_key: key
  };
}

export async function getAuthorStories(authorId, query) {
  const author = await db('authors')
    .where({ id: authorId })
    .whereNull('deleted_at')
    .first();

  if (!author) {
    throw new AppError('NOT_FOUND', 'Author not found', 404);
  }

  const { page, limit, offset } = getPagination(query);

  const countResult = await db('stories')
    .where({ author_id: authorId })
    .whereNull('deleted_at')
    .count('* as count')
    .first();

  const total = parseInt(countResult.count, 10);

  const stories = await db('stories')
    .select(
      'id', 'author_id', 'title_kn', 'title_en', 'genre', 'language',
      'published_year', 'summary', 'content_type', 'pdf_url', 'status',
      'created_at', 'updated_at'
    )
    .where({ author_id: authorId })
    .whereNull('deleted_at')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    author: {
      id: author.id,
      name_kn: author.name_kn,
      name_en: author.name_en
    },
    stories,
    meta: buildMeta(page, limit, total)
  };
}

export async function deleteAuthor(authorId, userId) {
  const author = await db('authors')
    .where({ id: authorId })
    .whereNull('deleted_at')
    .first();

  if (!author) {
    throw new AppError('NOT_FOUND', 'Author not found', 404);
  }

  // Rule 6: An author cannot be deleted while they have non-deleted stories (return 409)
  const activeStoriesCount = await db('stories')
    .where({ author_id: authorId })
    .whereNull('deleted_at')
    .count('* as count')
    .first();

  if (parseInt(activeStoriesCount.count, 10) > 0) {
    throw new AppError(
      'CONFLICT',
      'Cannot delete author because they still have active stories linked to them',
      409
    );
  }

  // Soft delete
  await db('authors').where({ id: authorId }).update({
    deleted_at: db.fn.now(),
    updated_by: userId,
    updated_at: db.fn.now()
  });
}
