import type { BotContext } from '../types';

export interface CommandDefinition {
  command: string;
  description: string;
  handler: (ctx: BotContext) => Promise<void>;
}

export function createCommand(def: CommandDefinition) {
  return def;
}
