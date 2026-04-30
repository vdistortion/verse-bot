import { getSupabaseClient } from './client.js';

export async function addUser(platform: 'telegram' | 'vk', platformUserId: string): Promise<void> {
  const db = getSupabaseClient();

  const { error } = await db.from('users').upsert(
    {
      platform,
      platform_user_id: platformUserId,
    },
    { onConflict: 'platform,platform_user_id' },
  );

  if (error) {
    console.error('Error adding user:', error);
  }
}

export async function removeUser(
  platform: 'telegram' | 'vk',
  platformUserId: string,
): Promise<void> {
  const db = getSupabaseClient();

  const { error } = await db
    .from('users')
    .delete()
    .eq('platform', platform)
    .eq('platform_user_id', platformUserId);

  if (error) {
    console.error('Error removing user:', error);
  }
}

export async function userExists(
  platform: 'telegram' | 'vk',
  platformUserId: string,
): Promise<boolean> {
  const db = getSupabaseClient();

  const { data, error } = await db
    .from('users')
    .select('id')
    .eq('platform', platform)
    .eq('platform_user_id', platformUserId)
    .single();

  return !error && !!data;
}

export async function getAllUsers(): Promise<
  { platform: string; platform_user_id: string; created_at: string }[]
> {
  const db = getSupabaseClient();

  const { data, error } = await db
    .from('users')
    .select('platform, platform_user_id, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}
