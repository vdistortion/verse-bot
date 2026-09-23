import type { Pool } from 'pg';
import type { BotDatabase, Platform } from '@verse-bot/core';

/** Creates the optional database integration consumed by bot adapters. */
export function createPostgresDatabase(pool: Pool): BotDatabase {
  return {
    client: {
      query: async <T = unknown>(text: string, values?: readonly unknown[]) => {
        const result = await pool.query(text, values ? [...values] : undefined);
        return { rows: result.rows as T[] };
      },
    },
    persistence: {
      async findOrCreateUser(platform: Platform, platformUserId: string) {
        const column = platform === 'telegram' ? 'tg_id' : 'vk_id';
        const { rows } = await pool.query<{ id: number }>(
          `INSERT INTO users (${column}) VALUES ($1) ON CONFLICT (${column}) DO UPDATE SET updated_at = now() RETURNING id`,
          [platformUserId],
        );
        return rows[0] ?? null;
      },
      async userExists(platform: Platform, platformUserId: string) {
        const column = platform === 'telegram' ? 'tg_id' : 'vk_id';
        const { rows } = await pool.query<{ id: number }>(
          `SELECT id FROM users WHERE ${column} = $1 LIMIT 1`,
          [platformUserId],
        );
        return rows.length > 0;
      },
      async logCommand(dbUserId: number, platform: Platform, command: string) {
        await pool.query(
          'INSERT INTO command_logs (user_id, platform, command) VALUES ($1, $2, $3)',
          [dbUserId, platform, command],
        );
      },
    },
  };
}
