# @verse-bot/core

Platform-neutral types and utilities for Verse Bot adapters.

## Install

```bash
npm install @verse-bot/core
```

## What it provides

- `UniversalContext`, `Platform` and shared message types;
- `dispatchUniversalCommand` for common command routing;
- `requireAdmin` and `requirePrivateChat` guards;
- `catchErrors` for consistent command error handling;
- `http` for small JSON HTTP requests;
- authentication and command logging middleware;
- the optional `BotDatabase` contract used by persistence adapters.

The package is ESM-only and has no runtime dependencies.

## Example

```ts
import { dispatchUniversalCommand, type UniversalContext } from '@verse-bot/core';

const commands = {
  start: async (ctx: UniversalContext) => {
    await ctx.reply('Hello!');
  },
};

await dispatchUniversalCommand(ctx, '/start', { commands });
```

Platform-specific bot adapters are provided by `@verse-bot/telegram` and `@verse-bot/vk`.

## License

Apache-2.0
