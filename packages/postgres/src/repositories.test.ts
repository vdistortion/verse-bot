import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getPool: vi.fn(),
  query: vi.fn(),
}));

vi.mock('./client.js', () => ({ getPool: mocks.getPool }));

import { getAllUsers, removeUser, userExists } from './users.js';
import { getCommandStats, getUserCommandLogs, logCommand } from './commandLogs.js';

describe('Postgres repositories', () => {
  beforeEach(() => {
    mocks.query.mockReset();
    mocks.getPool.mockReturnValue({ query: mocks.query });
  });

  it('removes command logs before removing a user', async () => {
    mocks.query.mockResolvedValue({ rows: [] });

    await removeUser('telegram', '100');

    expect(mocks.query.mock.calls).toEqual([
      ['DELETE FROM command_logs WHERE user_id = (SELECT id FROM users WHERE tg_id = $1)', ['100']],
      ['DELETE FROM users WHERE tg_id = $1', ['100']],
    ]);
  });

  it('maps user existence and user listing results', async () => {
    mocks.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }).mockResolvedValueOnce({
      rows: [{ id: 1, tg_id: '100' }],
    });

    await expect(userExists('vk', '200')).resolves.toBe(true);
    await expect(getAllUsers()).resolves.toEqual([{ id: 1, tg_id: '100' }]);
  });

  it('uses the optional day filter for command statistics', async () => {
    mocks.query.mockResolvedValue({ rows: [] });

    await getCommandStats(7);
    await getCommandStats();
    await getUserCommandLogs(42, 5);
    await logCommand(42, 'telegram', '/start');

    expect(mocks.query.mock.calls).toEqual([
      [expect.stringContaining("WHERE created_at > now() - interval '1 day' * $1"), [7]],
      [expect.stringContaining('FROM command_logs\n       GROUP BY command, platform')],
      ['SELECT * FROM command_logs WHERE user_id = $1 ORDER BY id DESC LIMIT $2', [42, 5]],
      [
        'INSERT INTO command_logs (user_id, platform, command) VALUES ($1, $2, $3)',
        [42, 'telegram', '/start'],
      ],
    ]);
  });
});
