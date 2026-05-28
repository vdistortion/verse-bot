export interface CommandDefinition {
  command: string;
  description: string;
  handler: (ctx: import('../types').VKContext) => void | Promise<void>;
}

export function parseCommand(text: string): { command: string; args: string } | null {
  if (!text || !text.startsWith('/')) return null;

  const parts = text.slice(1).split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');

  return { command, args };
}

export function createCommand(
  command: string,
  handler: (ctx: import('../types').VKContext, args: string) => void | Promise<void>,
): CommandDefinition {
  return {
    command: command.toLowerCase(),
    description: '',
    handler: async (ctx) => {
      const parsed = parseCommand(ctx.text);
      if (parsed) {
        await handler(ctx, parsed.args);
      }
    },
  };
}
