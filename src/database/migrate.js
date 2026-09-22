import knex from 'knex';
import config from '../../knexfile.js';

async function runMigrate() {
  const db = knex(config);
  try {
    console.log(`[Migration] Running migrations with client: ${config.client}...`);
    const [batchNo, log] = await db.migrate.latest();
    if (log.length === 0) {
      console.log('[Migration] Database is already up to date.');
    } else {
      console.log(`[Migration] Batch ${batchNo} run: ${log.length} migrations`);
      log.forEach((file) => console.log(`  - ${file}`));
    }
  } catch (err) {
    console.error('[Migration] Migration failed:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrate();
