import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

type DbInstance = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): DbInstance {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('DB ERROR: No DATABASE_URL or POSTGRES_URL environment variable found');
    throw new Error('No database connection string found. Set DATABASE_URL or POSTGRES_URL.');
  }
  console.log('DB: Connecting with', connectionString.substring(0, 25) + '...');
  const sql = neon(connectionString);
  return drizzle(sql, { schema });
}

let _db: DbInstance | undefined;

export function getDb(): DbInstance {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Lazy proxy so db is not created at import time (build-safe)
export const db = new Proxy({} as DbInstance, {
  get(_, prop) {
    const realDb = getDb();
    const val = (realDb as unknown as Record<string | symbol, unknown>)[prop];
    return typeof val === 'function' ? (val as Function).bind(realDb) : val;
  },
});
