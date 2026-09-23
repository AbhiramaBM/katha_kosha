/**
 * Migration: Create Kannada Katha Kosha tables
 * Charset: utf8mb4, Collation: utf8mb4_unicode_ci
 */
export async function up(knex) {
  // 1. users table
  await knex.schema.createTable('users', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 190).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['admin', 'editor']).notNullable().defaultTo('editor');
    table.boolean('is_active').notNullable().defaultTo(true);
    table.datetime('last_login_at').nullable();
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now());
  });


  await knex.schema.createTable('refresh_tokens', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.string('token_hash', 64).notNullable().unique(); // SHA-256 hash
    table.datetime('expires_at').notNullable();
    table.datetime('revoked_at').nullable();
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // 3. authors table
  await knex.schema.createTable('authors', (table) => {
    table.bigIncrements('id').primary();
    table.string('name_kn', 190).notNullable();
    table.string('name_en', 190).nullable();
    table.text('bio').nullable();
    table.string('photo_url', 500).nullable();
    table.string('photo_key', 500).nullable();
    table.smallint('birth_year').nullable();
    table.smallint('death_year').nullable();
    table.string('place', 190).nullable();
    table.bigInteger('created_by').unsigned().notNullable()
      .references('id').inTable('users');
    table.bigInteger('updated_by').unsigned().nullable()
      .references('id').inTable('users');
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('deleted_at').nullable();

    table.index('name_kn', 'idx_authors_name_kn');
    table.index('name_en', 'idx_authors_name_en');
    table.index('deleted_at', 'idx_authors_deleted');
  });

  // 4. stories table
  await knex.schema.createTable('stories', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('author_id').unsigned().notNullable()
      .references('id').inTable('authors');
    table.string('title_kn', 255).notNullable();
    table.string('title_en', 255).nullable();
    table.string('genre', 100).nullable();
    table.string('language', 10).notNullable().defaultTo('kn');
    table.smallint('published_year').nullable();
    table.text('summary').nullable();
    table.enum('content_type', ['text', 'pdf']).notNullable();
    table.text('content_text', 'longtext').nullable();
    table.string('pdf_url', 500).nullable();
    table.string('pdf_key', 500).nullable();
    table.enum('status', ['draft', 'published']).notNullable().defaultTo('draft');
    table.bigInteger('created_by').unsigned().notNullable()
      .references('id').inTable('users');
    table.bigInteger('updated_by').unsigned().nullable()
      .references('id').inTable('users');
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('deleted_at').nullable();

    table.index('author_id', 'idx_stories_author');
    table.index('title_kn', 'idx_stories_title_kn');
    table.index('status', 'idx_stories_status');
    table.index('deleted_at', 'idx_stories_deleted');
  });

  // 5. story_references table
  await knex.schema.createTable('story_references', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('story_id').unsigned().notNullable()
      .references('id').inTable('stories').onDelete('CASCADE');
    table.string('name', 190).notNullable();
    table.string('url', 1000).notNullable();
    table.smallint('sort_order').notNullable().defaultTo(0);
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    table.index('story_id', 'idx_refs_story');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('story_references');
  await knex.schema.dropTableIfExists('stories');
  await knex.schema.dropTableIfExists('authors');
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('users');
}
