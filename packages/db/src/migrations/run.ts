import Postgrator from 'postgrator';
import type { Pool } from 'pg';

export async function runMigrations(pool: Pool, migrationPattern: string): Promise<void> {
  const postgrator = new Postgrator({
    migrationPattern,
    driver: 'pg',
    execQuery: (query) => pool.query(query),
    schemaTable: 'schemaversion',
  });
  await postgrator.migrate();
}
