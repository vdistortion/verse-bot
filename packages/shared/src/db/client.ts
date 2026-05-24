import { Pool } from 'pg';

function createPool(): Pool {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DB } = process.env;

  const missing = ['POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_HOST', 'POSTGRES_DB'].filter(
    (key) => !process.env[key],
  );

  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const url = `postgres://${POSTGRES_USER}:${encodeURIComponent(POSTGRES_PASSWORD!)}@${POSTGRES_HOST}:5432/${POSTGRES_DB}`;
  return new Pool({ connectionString: url });
}

let pool: Pool | null = null;

export function db(): Pool {
  if (!pool) pool = createPool();
  return pool;
}
