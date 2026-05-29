import type { Platform } from '@verse-bot/md-format';
import { getPool } from './client.js';

export interface CommandStat {
  command: string;
  platform: string;
  count: number;
}

export interface CommandLogEntry {
  id: number;
  user_id: number;
  platform: string;
  command: string;
  created_at: string;
}

export async function getCommandStats(days?: number): Promise<CommandStat[]> {
  if (days) {
    const { rows } = await getPool().query<CommandStat>(
      `SELECT command, platform, count(*)::int as count
       FROM command_logs
       WHERE created_at > now() - interval '1 day' * $1
       GROUP BY command, platform
       ORDER BY count DESC`,
      [days],
    );
    return rows;
  } else {
    const { rows } = await getPool().query<CommandStat>(
      `SELECT command, platform, count(*)::int as count
       FROM command_logs
       GROUP BY command, platform
       ORDER BY count DESC`,
    );
    return rows;
  }
}

export async function getUserCommandLogs(userId: number, limit = 20): Promise<CommandLogEntry[]> {
  const { rows } = await getPool().query<CommandLogEntry>(
    `SELECT * FROM command_logs WHERE user_id = $1 ORDER BY id DESC LIMIT $2`,
    [userId, limit],
  );
  return rows;
}

export async function logCommand(
  dbUserId: number,
  platform: Platform,
  command: string,
): Promise<void> {
  await getPool().query(
    `INSERT INTO command_logs (user_id, platform, command) VALUES ($1, $2, $3)`,
    [dbUserId, platform, command],
  );
}

export async function getUserOwnCommandLogs(
  userId: number,
  limit = 20,
): Promise<CommandLogEntry[]> {
  return getUserCommandLogs(userId, limit); // Алиас
}
