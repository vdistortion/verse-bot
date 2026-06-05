# @verse-bot/shared

Core package that re-exports types, database helpers, formatting, keyboards, and command guards.

## Install

```bash
npm install @verse-bot/shared
```

## Contents

- **Types** – `UniversalContext`, `UniversalReplyOptions`, `Platform`, etc.
- **Database** – `initPool`, `getPool`, `findOrCreateUser`, `logCommand`, etc.
- **Formatting** – re-export of `@verse-bot/md-format` + `mdOpts`.
- **Keyboards** – `createVKKeyboard`, `createVKInlineKeyboard`.
- **Command guards** – `requireAdmin`, `requirePrivateChat`, `catchErrors`.

## Quick example

```ts
import { initPool, getPool, UniversalContext } from '@verse-bot/shared';
initPool({ user: 'postgres', password: '...', host: 'localhost', database: 'postgres' });

const handler = requireAdmin(async (ctx: UniversalContext) => {
  const users = await getAllUsers();
  await ctx.reply(`Users: ${users.length}`);
});
```

## Dependencies

- `@verse-bot/md-format`
- `pg`
