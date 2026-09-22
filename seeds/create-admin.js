import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import knex from 'knex';
import config from '../knexfile.js';

dotenv.config();

const BCRYPT_ROUNDS = 12;

async function createAdmin() {
  const db = knex(config);
  try {
    const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
    const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';
    const name = process.env.SEED_ADMIN_NAME || 'Chief Admin';

    console.log(`[Seed Admin] Checking admin account for: ${email}...`);

    const existing = await db('users').where({ email }).first();
    if (existing) {
      console.log(`[Seed Admin] Admin account already exists (ID: ${existing.id}).`);
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const [id] = await db('users').insert({
      name,
      email,
      password_hash: passwordHash,
      role: 'admin',
      is_active: 1
    });

    console.log(`[Seed Admin] Successfully created Admin user:`);
    console.log(`  - ID: ${id}`);
    console.log(`  - Name: ${name}`);
    console.log(`  - Email: ${email}`);
    console.log(`  - Role: admin`);
  } catch (err) {
    console.error('[Seed Admin] Error creating admin:', err);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

createAdmin();
