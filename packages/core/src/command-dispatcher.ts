import type { UniversalContext } from './context.js';

export type UniversalCommandHandler = (ctx: UniversalContext) => Promise<void>;

export interface UniversalCommandConfig {
  commands: Record<string, UniversalCommandHandler>;
  contentCommand?: (ctx: UniversalContext, itemNumber: number) => Promise<void>;
  userLogCommand?: (ctx: UniversalContext, userId: number) => Promise<void>;
}

export async function dispatchUniversalCommand(
  ctx: UniversalContext,
  command: string,
  config: UniversalCommandConfig,
): Promise<boolean> {
  const commandName = command.startsWith('/') ? command.slice(1) : command;
  const handler = config.commands[commandName];
  if (handler) {
    await handler(ctx);
    return true;
  }

  const contentMatch = commandName.match(/^content_(\d+)$/i);
  if (contentMatch && config.contentCommand) {
    const itemNumber = Number.parseInt(contentMatch[1], 10);
    if (itemNumber > 0) {
      await config.contentCommand(ctx, itemNumber);
      return true;
    }
  }

  const userLogMatch = commandName.match(/^userlog_(\d+)$/i);
  if (userLogMatch && config.userLogCommand) {
    const userId = Number.parseInt(userLogMatch[1], 10);
    if (userId > 0) {
      await config.userLogCommand(ctx, userId);
      return true;
    }
  }

  return false;
}
