# @verse-bot/tg-core

Telegram adapter based on [GrammY](https://grammy.dev/) for Verse Bot Framework.

## Install

```bash
npm install @verse-bot/tg-core grammy
```

## Usage

```ts
import { createUniversalTelegramBot } from '@verse-bot/tg-core';

const bot = createUniversalTelegramBot({
  token: '...',
  commands: {
    start: async (ctx) => {
      await ctx.reply('Hello!');
    },
  },
  buttons: [{ command: 'start', label: 'Start' }],
});

bot.start();
```

## API

`createUniversalTelegramBot(config: TelegramBotConfig)` returns a ready‑to‑use `Bot<BotContext>` from Grammy.

### TelegramBotConfig

- `token` – bot token
- `adminId?` – admin ID
- `commands` – command handlers
- `buttons` – button mappings
- `contentCommand?` – handler for `/content_<N>`
- `userLogCommand?` – handler for `/userlog_<N>`
- `onReplyWithPhoto?` – custom photo sending
- `contentDir?` – path to content folder

## Middleware

- `dbMiddleware` – attaches database pool
- `loggerMiddleware` – logs incoming messages
