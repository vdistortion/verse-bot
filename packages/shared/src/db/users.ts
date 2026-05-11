import { db } from './client.js';
import type { Platform } from '../universal-context';

export interface DbUser {
  id: number;
  tg_id: string | null;
  vk_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function findOrCreateUser(
  platform: Platform,
  platformUserId: string,
): Promise<DbUser | null> {
  const column = platform === 'telegram' ? 'tg_id' : 'vk_id';
  const { rows } = await db().query<DbUser>(
    `INSERT INTO users (${column}) VALUES ($1) ON CONFLICT (${column}) DO UPDATE SET updated_at = now() RETURNING *`,
    [platformUserId],
  );
  return rows[0] ?? null;
}

export async function removeUser(platform: Platform, platformUserId: string): Promise<void> {
  const column = platform === 'telegram' ? 'tg_id' : 'vk_id';

  await db().query(
    `DELETE FROM command_logs WHERE user_id = (SELECT id FROM users WHERE ${column} = $1)`,
    [platformUserId],
  );

  await db().query(`DELETE FROM users WHERE ${column} = $1`, [platformUserId]);
}

export async function userExists(platform: Platform, platformUserId: string): Promise<boolean> {
  const column = platform === 'telegram' ? 'tg_id' : 'vk_id';
  const { rows } = await db().query<{ id: number }>(
    `SELECT id FROM users WHERE ${column} = $1 LIMIT 1`,
    [platformUserId],
  );
  return rows.length > 0;
}

export async function getAllUsers(): Promise<DbUser[]> {
  const { rows } = await db().query<DbUser>('SELECT * FROM users ORDER BY created_at DESC');
  return rows;
}
