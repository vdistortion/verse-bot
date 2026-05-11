import { Pool } from 'pg';

function getPool(): Pool {
  const { POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_HOST, POSTGRES_DB } = process.env;
  if (!POSTGRES_USER || !POSTGRES_PASSWORD || !POSTGRES_DB || !POSTGRES_HOST) {
    throw new Error('Критическая ошибка: Не все переменные POSTGRES_* найдены!');
  }
  const url = `postgres://${POSTGRES_USER}:${encodeURIComponent(POSTGRES_PASSWORD)}@${POSTGRES_HOST}:5432/${POSTGRES_DB}`;
  return new Pool({ connectionString: url });
}

let pool: Pool | null = null;
export function db(): Pool {
  if (!pool) pool = getPool();
  return pool;
}
