import { describe, expect, it } from 'vitest';
import { createPool, getPool, initPool } from './client.js';

describe('Postgres pool client', () => {
  it('throws before the singleton pool is initialized', () => {
    expect(() => getPool()).toThrow('Database pool not initialized. Call initPool() first.');
  });

  it('creates independent pools and exposes the initialized singleton', async () => {
    const first = createPool({ max: 1 });
    const second = initPool({ max: 2 });

    expect(first).not.toBe(second);
    expect(getPool()).toBe(second);
    await first.end();
    await second.end();
  });
});
