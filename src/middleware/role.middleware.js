import { errorResponse } from '../utils/response.js';

/**
 * Role authorization middleware
 * @param  {...string} allowedRoles 
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'FORBIDDEN', `Role '${req.user.role}' is not authorized to perform this action`, 403);
    }

    next();
  };
}
