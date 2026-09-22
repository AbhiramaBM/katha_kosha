import { errorResponse } from '../utils/response.js';

/**
 * Middleware factory to validate schema for body, query, and params
 */
export function validate(schema) {
  return (req, res, next) => {
    try {
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        const primaryMessage = details[0]?.message || 'Validation failed';
        return errorResponse(res, 'VALIDATION_ERROR', primaryMessage, 400, details);
      }
      return errorResponse(res, 'VALIDATION_ERROR', err.message, 400);
    }
  };
}
