import dotenv from 'dotenv';
dotenv.config();

const client = process.env.DB_CLIENT || 'mysql2';

const config = {
  client: client,
  connection: client === 'sqlite3' 
    ? {
        filename: process.env.DB_FILENAME || './katha_kosha.sqlite'
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'katha_kosha',
        charset: 'utf8mb4'
      },
  useNullAsDefault: client === 'sqlite3',
  pool: {
    min: 2,
    max: 10,
    afterCreate: client === 'sqlite3' ? (conn, cb) => {
      conn.run('PRAGMA foreign_keys = ON;', cb);
    } : undefined
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

export default config;
