import type { VKContext } from '../types';

export function createErrorHandler() {
  return (err: Error, ctx: VKContext) => {
    console.error(`[Error] User ${ctx.userId}:`);
    console.error(err);
  };
}
