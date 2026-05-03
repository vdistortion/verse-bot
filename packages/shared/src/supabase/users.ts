import { getSupabaseClient } from './client.js';
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
  const db = getSupabaseClient();
  const userToUpsert: Partial<DbUser> = {}; // Больше не включаем имена/юзернеймы

  let onConflictColumn: 'tg_id' | 'vk_id';

  if (platform === 'telegram') {
    userToUpsert.tg_id = platformUserId;
    onConflictColumn = 'tg_id';
  } else if (platform === 'vk') {
    userToUpsert.vk_id = platformUserId;
    onConflictColumn = 'vk_id';
  } else {
    console.error('Unknown platform:', platform);
    return null;
  }

  const { data, error } = await db
    .from('users')
    .upsert(userToUpsert, {
      onConflict: onConflictColumn,
      ignoreDuplicates: false,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error finding or creating user:', error);
    return null;
  }

  return data as DbUser;
}

export async function removeUser(platform: Platform, platformUserId: string): Promise<void> {
  const db = getSupabaseClient();

  const query = db.from('users').delete();

  if (platform === 'telegram') {
    query.eq('tg_id', platformUserId);
  } else if (platform === 'vk') {
    query.eq('vk_id', platformUserId);
  } else {
    console.error('Unknown platform for removeUser:', platform);
    return;
  }

  const { data, error } = await query.select();
  if (error) {
    console.error('Error removing user:', error);
  } else {
    console.log(`Removed user: ${platform} ${platformUserId}`, data);
  }
}

export async function userExists(platform: Platform, platformUserId: string): Promise<boolean> {
  const db = getSupabaseClient();

  const query = db.from('users').select('id');

  if (platform === 'telegram') {
    query.eq('tg_id', platformUserId);
  } else if (platform === 'vk') {
    query.eq('vk_id', platformUserId);
  } else {
    console.error('Unknown platform for userExists:', platform);
    return false;
  }

  const { data, error } = await query.single();

  return !error && !!data;
}

export async function getAllUsers(): Promise<DbUser[]> {
  const db = getSupabaseClient();

  const { data, error } = await db
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}
