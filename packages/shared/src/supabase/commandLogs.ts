import { getSupabaseClient } from './client.js';
import type { Platform } from '../universal-context';

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
  tg_id?: string | null;
  vk_id?: string | null;
}

export async function getCommandStats(days?: number): Promise<CommandStat[]> {
  const db = getSupabaseClient();
  if (days) {
    const { data, error } = await db.rpc('get_command_stats_recent', { days });
    if (error) throw error;
    return data ?? [];
  }
  const { data, error } = await db.rpc('get_command_stats_all');
  if (error) throw error;
  return data ?? [];
}

export async function getUserCommandLogs(userId: number, limit = 20): Promise<CommandLogEntry[]> {
  const db = getSupabaseClient();
  const { data, error } = await db
    .from('command_logs')
    .select('*, users(tg_id, vk_id)')
    .eq('user_id', userId)
    .order('id', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as CommandLogEntry[];
}

export async function logCommand(
  dbUserId: number,
  platform: Platform,
  command: string,
): Promise<void> {
  const db = getSupabaseClient();

  const { error } = await db.from('command_logs').insert({
    user_id: dbUserId,
    platform,
    command,
  });

  if (error) {
    console.error('Error logging command:', error);
  }
}
