import { describe, expect, it } from 'vitest';
import { withTypingIndicator } from './typing.js';

interface TestTimer {
  callback: () => void;
  delayMs: number;
  cancelled: boolean;
}

function setup() {
  const timers: TestTimer[] = [];
  const errors: unknown[] = [];
  const schedule = (callback: () => void, delayMs: number) => {
    const timer = { callback, delayMs, cancelled: false };
    timers.push(timer);
    return () => {
      timer.cancelled = true;
    };
  };

  return { timers, errors, schedule };
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe('withTypingIndicator', () => {
  it('sends the indicator immediately and stops refreshing after the operation', async () => {
    const { timers, errors, schedule } = setup();
    const actions: string[] = [];

    const result = await withTypingIndicator(
      () => {
        actions.push('typing');
      },
      async () => 'reply',
      { schedule, onError: (error) => errors.push(error) },
    );

    expect(result).toBe('reply');
    expect(actions).toEqual(['typing']);
    expect(timers[0]?.delayMs).toBe(4_000);
    expect(timers.at(-1)?.cancelled).toBe(true);
    expect(errors).toEqual([]);
  });

  it('refreshes every four seconds while the operation is pending', async () => {
    const { timers, errors, schedule } = setup();
    const actions: string[] = [];
    const work = deferred();

    const pending = withTypingIndicator(
      () => {
        actions.push('typing');
      },
      () => work.promise,
      { schedule, onError: (error) => errors.push(error) },
    );

    expect(actions).toEqual(['typing']);

    await Promise.resolve();
    await Promise.resolve();
    timers[0]?.callback();
    expect(actions).toEqual(['typing', 'typing']);

    work.resolve();
    await pending;

    expect(timers.at(-1)?.cancelled).toBe(true);
    timers.at(-1)?.callback();
    expect(actions).toEqual(['typing', 'typing']);
  });

  it('reports indicator failures without interrupting the operation', async () => {
    for (const failure of [
      () => {
        throw new Error('sync failure');
      },
      () => Promise.reject(new Error('async failure')),
    ]) {
      const { timers, errors, schedule } = setup();

      const result = await withTypingIndicator(failure, async () => 'reply', {
        schedule,
        onError: (error) => errors.push(error),
      });

      expect(result).toBe('reply');
      expect(errors).toHaveLength(1);
      expect(timers.at(-1)?.cancelled).toBe(true);
    }
  });

  it('does not stack indicator requests while the previous one is in flight', async () => {
    const { timers, errors, schedule } = setup();
    const request = deferred();
    const work = deferred();
    let sent = 0;

    const pending = withTypingIndicator(
      () => {
        sent += 1;
        return request.promise;
      },
      () => work.promise,
      { schedule, onError: (error) => errors.push(error) },
    );

    timers[0]?.callback();
    expect(sent).toBe(1);

    request.resolve();
    await Promise.resolve();
    await Promise.resolve();

    timers[0]?.callback();
    expect(sent).toBe(2);

    work.resolve();
    await pending;
    expect(timers.at(-1)?.cancelled).toBe(true);
  });

  it('propagates operation errors and still clears the refresh timer', async () => {
    const { timers, schedule } = setup();

    await expect(
      withTypingIndicator(
        () => Promise.resolve(),
        async () => {
          throw new Error('render failed');
        },
        { schedule },
      ),
    ).rejects.toThrow('render failed');

    expect(timers.at(-1)?.cancelled).toBe(true);
  });
});
