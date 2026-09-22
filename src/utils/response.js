/**
 * Standard API Response Format (Section 7)
 * Success: { "success": true, "data": { ... }, "meta": { ... } }
 * Error:   { "success": false, "error": { "code": "...", "message": "...", "details": [] } }
 */

export function successResponse(res, data, meta = null, statusCode = 200) {
  const response = {
    success: true,
    data: data
  };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
}

export function errorResponse(res, code, message, statusCode = 400, details = []) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details
    }
  });
}

export class AppError extends Error {
  constructor(code, message, statusCode = 400, details = []) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
