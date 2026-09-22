import jwt from 'jsonwebtoken';
import { db } from '../config/database.js';
import { errorResponse } from '../utils/response.js';
import dotenv from 'dotenv';
dotenv.config();

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'UNAUTHORIZED', 'Missing or invalid authorization header', 401);
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'TOKEN_EXPIRED', 'Access token has expired', 401);
      }
      return errorResponse(res, 'INVALID_TOKEN', 'Invalid access token', 401);
    }

    // Fetch user and check active status
    const user = await db('users').where({ id: payload.sub }).first();
    if (!user) {
      return errorResponse(res, 'USER_NOT_FOUND', 'User not found', 401);
    }

    if (!user.is_active) {
      return errorResponse(res, 'USER_INACTIVE', 'User account has been disabled', 401);
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    next(error);
  }
}
