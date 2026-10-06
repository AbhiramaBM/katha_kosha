/**
 * Migration: Add 'user' role to users table
 */
export const config = { transaction: false };

export async function up(knex) {
  const isSqlite = knex.client.config.client === 'sqlite3';
  if (isSqlite) {
    await knex.raw('PRAGMA foreign_keys = OFF;');
    await knex.raw(`
      CREATE TABLE users_temp (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role TEXT CHECK (role IN ('admin', 'editor', 'user')) NOT NULL DEFAULT 'user',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        last_login_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await knex.raw(`
      INSERT INTO users_temp (id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at)
      SELECT id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at FROM users;
    `);
    await knex.raw('DROP TABLE users;');
    await knex.raw('ALTER TABLE users_temp RENAME TO users;');
    await knex.raw('PRAGMA foreign_keys = ON;');
  } else {
    await knex.raw("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'editor', 'user') NOT NULL DEFAULT 'user';");
  }
}

export async function down(knex) {
  const isSqlite = knex.client.config.client === 'sqlite3';
  if (isSqlite) {
    await knex.raw('PRAGMA foreign_keys = OFF;');
    await knex.raw(`
      CREATE TABLE users_temp (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(120) NOT NULL,
        email VARCHAR(190) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role TEXT CHECK (role IN ('admin', 'editor')) NOT NULL DEFAULT 'editor',
        is_active BOOLEAN NOT NULL DEFAULT 1,
        last_login_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await knex.raw(`
      INSERT INTO users_temp (id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at)
      SELECT id, name, email, password_hash, role, is_active, last_login_at, created_at, updated_at FROM users WHERE role IN ('admin', 'editor');
    `);
    await knex.raw('DROP TABLE users;');
    await knex.raw('ALTER TABLE users_temp RENAME TO users;');
    await knex.raw('PRAGMA foreign_keys = ON;');
  } else {
    await knex.raw("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor';");
  }
}
