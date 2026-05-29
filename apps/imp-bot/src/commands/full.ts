import type { UniversalContext } from '@verse/shared';
import { startCommand } from './start.js';

export async function fullCommand(ctx: UniversalContext): Promise<void> {
  await startCommand(ctx, true);
}
