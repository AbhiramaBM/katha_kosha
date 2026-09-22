import * as authorsService from './authors.service.js';
import { successResponse } from '../../utils/response.js';

export async function createAuthor(req, res, next) {
  try {
    const author = await authorsService.createAuthor(req.body, req.user.id);
    return successResponse(res, author, null, 201);
  } catch (error) {
    next(error);
  }
}

export async function listAuthors(req, res, next) {
  try {
    const { authors, meta } = await authorsService.listAuthors(req.query);
    return successResponse(res, authors, meta, 200);
  } catch (error) {
    next(error);
  }
}

export async function getAuthor(req, res, next) {
  try {
    const author = await authorsService.getAuthorById(req.params.id);
    return successResponse(res, author, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function updateAuthor(req, res, next) {
  try {
    const author = await authorsService.updateAuthor(req.params.id, req.body, req.user.id);
    return successResponse(res, author, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function uploadPhoto(req, res, next) {
  try {
    const result = await authorsService.uploadAuthorPhoto(req.params.id, req.file, req.user.id);
    return successResponse(res, result, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function getStories(req, res, next) {
  try {
    const result = await authorsService.getAuthorStories(req.params.id, req.query);
    return successResponse(res, result.stories, result.meta, 200);
  } catch (error) {
    next(error);
  }
}

export async function deleteAuthor(req, res, next) {
  try {
    await authorsService.deleteAuthor(req.params.id, req.user.id);
    return successResponse(res, { message: 'Author deleted successfully' }, null, 200);
  } catch (error) {
    next(error);
  }
}
