import { afterEach, describe, expect, it, vi } from 'vitest';
import { http } from './http.js';

afterEach(() => vi.restoreAllMocks());

describe('http', () => {
  it('serializes query parameters and returns JSON', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));

    await expect(
      http<{ ok: boolean }, { search: string; page: number }>('/api', {
        search: 'hello world',
        page: 2,
      }),
    ).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('/api?search=hello+world&page=2');
  });

  it('throws a useful error for unsuccessful responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));

    await expect(http('/api')).rejects.toThrow('HTTP error! status: 503');
  });
});
