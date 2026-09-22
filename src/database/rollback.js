import knex from 'knex';
import config from '../../knexfile.js';

async function runRollback() {
  const db = knex(config);
  try {
    console.log(`[Migration] Rolling back migrations with client: ${config.client}...`);
    const [batchNo, log] = await db.migrate.rollback();
    console.log(`[Migration] Batch ${batchNo} rolled back: ${log.length} migrations`);
    log.forEach((file) => console.log(`  - ${file}`));
  } catch (err) {
    console.error('[Migration] Rollback failed:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runRollback();
