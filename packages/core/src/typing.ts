export type TypingSchedule = (callback: () => void, delayMs: number) => () => void;

export interface TypingIndicatorOptions {
  /** How often the indicator is refreshed while the operation is running. */
  intervalMs?: number;
  /** Timer implementation, primarily useful for tests. */
  schedule?: TypingSchedule;
  /** Receives errors from the indicator without interrupting the operation. */
  onError?: (error: unknown) => void;
}

const DEFAULT_INTERVAL_MS = 4_000;

function defaultSchedule(callback: () => void, delayMs: number): () => void {
  const timer = setTimeout(callback, delayMs);
  timer.unref();
  return () => clearTimeout(timer);
}

/**
 * Keeps a platform "typing" indicator active while an asynchronous operation runs.
 * Indicator failures never interrupt the operation itself.
 */
export async function withTypingIndicator<T>(
  send: () => unknown,
  operation: () => Promise<T>,
  options: TypingIndicatorOptions = {},
): Promise<T> {
  const intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS;
  const schedule = options.schedule ?? defaultSchedule;
  const report = options.onError ?? ((error: unknown) => console.error('Typing indicator:', error));

  let stopped = false;
  let inFlight = false;
  let cancel: (() => void) | undefined;

  const indicate = () => {
    if (stopped || inFlight) return;
    inFlight = true;

    try {
      void Promise.resolve(send())
        .catch(report)
        .finally(() => {
          inFlight = false;
        });
    } catch (error) {
      inFlight = false;
      report(error);
    }
  };

  const refresh = () => {
    if (stopped) return;
    indicate();
    cancel = schedule(refresh, intervalMs);
  };

  indicate();
  cancel = schedule(refresh, intervalMs);

  try {
    return await operation();
  } finally {
    stopped = true;
    cancel?.();
  }
}
