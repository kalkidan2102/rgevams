import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool, PoolConfig } from 'pg';
import * as schema from './Schema';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    const config: PoolConfig = process.env.SQL_HOST
      ? {
          host: process.env.SQL_HOST,
          port: parseInt(process.env.SQL_PORT || '5432', 10),
          user: process.env.SQL_USER || process.env.SQL_ADMIN_USER || 'postgres',
          password: process.env.SQL_PASSWORD || process.env.SQL_ADMIN_PASSWORD || '',
          database: process.env.SQL_DB_NAME || 'cloud_sql_development_database',
        }
      : process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL }
      : {
          host: 'localhost',
          port: 5432,
          user: 'postgres',
          password: '',
          database: 'rgevams',
        };

    global._postgresPool = new Pool({
      ...config,
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = drizzle(pool, { schema });
export { pool, schema };

