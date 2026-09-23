# `@verse-bot/telegram`

Telegram bot adapter based on [grammY](https://grammy.dev/).

## Install

```bash
npm install @verse-bot/telegram
```

## Usage

```ts
import { createUniversalTelegramBot } from '@verse-bot/telegram';

const bot = createUniversalTelegramBot({
  token: process.env.TELEGRAM_BOT_TOKEN!,
  commands: {
    start: async (ctx) => {
      await ctx.reply('Hello!');
    },
  },
  buttons: [],
});

await bot.start();
```

The factory creates a universal context, dispatches commands, applies optional database and logging middleware, and renders shared keyboards for Telegram.

Use the optional `onCallback` configuration when an inline button carries raw callback data in addition to a command.

For Telegram rich text, use [`tg-rich-messages`](https://www.npmjs.com/package/tg-rich-messages). See its [GitHub repository](https://github.com/vdistortion/tg-rich-messages) for the API and examples.

## License

Apache-2.0
