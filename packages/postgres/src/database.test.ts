import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { createPostgresDatabase } from './database.js';

function createPool() {
  const query = vi.fn().mockResolvedValue({ rows: [{ id: 42 }] });
  return { pool: { query } as unknown as Pool, query };
}

describe('createPostgresDatabase', () => {
  it('forwards client queries and returns rows', async () => {
    const { pool, query } = createPool();
    const database = createPostgresDatabase(pool);

    await expect(database.client.query<{ id: number }>('SELECT $1', ['value'])).resolves.toEqual({
      rows: [{ id: 42 }],
    });
    expect(query).toHaveBeenCalledWith('SELECT $1', ['value']);
  });

  it('uses platform-specific columns for user persistence', async () => {
    const { pool, query } = createPool();
    const database = createPostgresDatabase(pool);

    await expect(database.persistence.findOrCreateUser('telegram', '100')).resolves.toEqual({
      id: 42,
    });
    await database.persistence.userExists('vk', '200');

    expect(query.mock.calls[0]).toEqual([
      'INSERT INTO users (tg_id) VALUES ($1) ON CONFLICT (tg_id) DO UPDATE SET updated_at = now() RETURNING id',
      ['100'],
    ]);
    expect(query.mock.calls[1]).toEqual(['SELECT id FROM users WHERE vk_id = $1 LIMIT 1', ['200']]);
  });

  it('writes command logs with all identifying fields', async () => {
    const { pool, query } = createPool();
    const database = createPostgresDatabase(pool);

    await database.persistence.logCommand(7, 'vk', '/help');

    expect(query).toHaveBeenCalledWith(
      'INSERT INTO command_logs (user_id, platform, command) VALUES ($1, $2, $3)',
      [7, 'vk', '/help'],
    );
  });
});
