import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { logger } from './utils/logger.js';
import { db, testConnection } from './config/database.js';
import { errorHandler } from './middleware/error.middleware.js';
import { errorResponse, successResponse } from './utils/response.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import authorsRoutes from './modules/authors/authors.routes.js';
import storiesRoutes from './modules/stories/stories.routes.js';

dotenv.config();

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS'));
  },
  credentials: true
}));

// Request logging
app.use(pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => req.url === '/health'
  }
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for local uploads driver
const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads');
app.use('/uploads', express.static(uploadDir));

// Static file serving for frontend
const distDir = path.resolve('./frontend/dist');
const publicDir = path.resolve('./public');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// Health check endpoint (Section 11)
app.get('/health', async (req, res) => {
  const isDbOk = await testConnection();
  if (isDbOk) {
    return res.status(200).json({ status: 'ok', database: 'connected' });
  }
  return res.status(503).json({ status: 'error', database: 'disconnected' });
});

// API Routes (Base URL: /api/v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/authors', authorsRoutes);
app.use('/api/v1/stories', storiesRoutes);

// SPA fallback for HTML requests (excluding /api, /uploads, /health)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') {
    return next();
  }
  const distIndex = path.join(distDir, 'index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  const publicIndex = path.join(publicDir, 'index.html');
  if (fs.existsSync(publicIndex)) {
    return res.sendFile(publicIndex);
  }
  return res.status(200).send('Kannada Katha Kosha API Server is running.');
});

// Catch 404 for undefined routes
app.use((req, res) => {
  return errorResponse(res, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`, 404);
});

// Central error handler
app.use(errorHandler);

export default app;
