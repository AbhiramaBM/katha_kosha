import app from './app.js';
import { logger } from './utils/logger.js';
import { testConnection } from './config/database.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const isDbConnected = await testConnection();
    if (!isDbConnected) {
      logger.warn('[Server] Initial database connection check failed. Server will continue and retry on requests.');
    }

    app.listen(PORT, () => {
      logger.info(`[Server] Kannada Katha Kosha API server running on port ${PORT}`);
      logger.info(`[Server] Health check: http://localhost:${PORT}/health`);
      logger.info(`[Server] API Base URL: http://localhost:${PORT}/api/v1`);
    });
  } catch (error) {
    logger.error('[Server] Fatal startup error:', error);
    process.exit(1);
  }
}

startServer();
