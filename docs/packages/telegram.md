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

Use `callbackData` on inline keyboard buttons for application-specific values. The callback
context exposes normalized `data`, `messageId`, `answer(text?)` and `editMessage(message, options?)`.
The adapter automatically acknowledges callbacks not explicitly answered by the handler.

`onMessage` receives incoming updates not handled by registered commands or buttons. If configured,
it takes precedence over the generic unknown-message response. `checkAdmin` can asynchronously
resolve administrators using platform roles in addition to `adminId`.

The shared `UniversalContext` provides photo sending and safe replies that suppress reply keyboards
in group chats, one-time keyboards and keyboard removal. Telegram also supports the optional
`replyWithFile` capability. Custom photo hooks receive the universal context as their first argument,
matching the VK adapter.

For Telegram rich text, use [`tg-rich-messages`](https://www.npmjs.com/package/tg-rich-messages). See its [GitHub repository](https://github.com/vdistortion/tg-rich-messages) for the API and examples.

## License

Apache-2.0
