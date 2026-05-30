import type { VKContext } from '../types/index.js';

export function createErrorHandler() {
  return (err: Error, ctx: VKContext) => {
    console.error(`[Error] User ${ctx.userId}:`);
    console.error(err);
  };
}
