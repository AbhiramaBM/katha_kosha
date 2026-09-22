import multer from 'multer';
import { errorResponse, AppError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(err);

  // App custom errors
  if (err instanceof AppError) {
    return errorResponse(res, err.code, err.message, err.statusCode, err.details);
  }

  // Multer file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'FILE_TOO_LARGE', 'Uploaded file exceeds the maximum allowed size', 413);
    }
    return errorResponse(res, 'UPLOAD_ERROR', err.message, 400);
  }

  // Malformed JSON body
  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 'INVALID_JSON', 'Malformed JSON in request body', 400);
  }

  // Default internal server error
  const isDev = process.env.NODE_ENV !== 'production';
  return errorResponse(
    res,
    'INTERNAL_SERVER_ERROR',
    isDev ? err.message : 'An unexpected error occurred',
    500,
    isDev ? [err.stack] : []
  );
}
