import knex from 'knex';
import config from '../../knexfile.js';
import { logger } from '../utils/logger.js';

export const db = knex(config);

export async function testConnection() {
  try {
    if (config.client === 'sqlite3') {
      await db.raw('SELECT 1');
    } else {
      await db.raw('SELECT 1+1 AS result');
    }
    logger.info(`[Database] Connected successfully using client: ${config.client}`);
    return true;
  } catch (error) {
    logger.error('[Database] Connection failed:', error);
    return false;
  }
}
