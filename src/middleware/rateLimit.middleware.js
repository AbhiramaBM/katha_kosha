import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 100, // 5 in production (Section 6.6), relaxed in dev for automated tests
  skip: () => process.env.NODE_ENV === 'test',
  keyGenerator: (req) => {
    const email = req.body?.email ? String(req.body.email).toLowerCase().trim() : 'anonymous';
    const ip = req.ip || req.connection.remoteAddress || 'unknown-ip';
    return `${ip}:${email}`;
  },
  handler: (req, res) => {
    return errorResponse(res, 'RATE_LIMIT_EXCEEDED', 'Too many login attempts. Please try again after 15 minutes.', 429);
  }
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // General API limiter
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(res, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please slow down.', 429);
  }
});
