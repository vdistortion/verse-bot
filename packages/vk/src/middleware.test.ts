import { describe, expect, it, vi } from 'vitest';
import { createErrorHandler } from './middleware/error-handler.js';
import { createLoggerMiddleware } from './middleware/logger.js';

describe('VK middleware', () => {
  it('logs incoming and completed updates', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const next = vi.fn().mockResolvedValue(undefined);
    const ctx = { senderId: 12, text: 'hello' } as never;

    await createLoggerMiddleware()(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0]?.[0]).toContain('VK @12: hello');
    log.mockRestore();
  });

  it('reports errors through the console', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const failure = new Error('broken');

    createErrorHandler()(failure);

    expect(error).toHaveBeenCalledWith('[VK Error] broken');
    expect(error).toHaveBeenCalledWith(failure);
    error.mockRestore();
  });
});
