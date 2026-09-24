# @verse-bot/telegram

Telegram adapter based on [GrammY](https://grammy.dev/) for Verse Bot Framework.

## Install

```bash
npm install @verse-bot/telegram
```

## Usage

```ts
import { createUniversalTelegramBot } from '@verse-bot/telegram';

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
- `database?` – optional database integration, for example `createPostgresDatabase(pool)` from `@verse-bot/postgres`
- `adminId?` – admin ID
- `commands` – command handlers
- `buttons` – button mappings
- `onCallback?` – handler for raw callback data when a button carries more than a command
- `onMessage?` – fallback for incoming updates not handled by commands or button mappings
- `checkAdmin?` – asynchronous admin check for roles beyond the configured `adminId`
- `contentCommand?` – handler for `/content_<N>`
- `userLogCommand?` – handler for `/userlog_<N>`
- `unknownCommandPhrase?`, `getButtonsForUnknown?` – optional response for unknown private-chat messages
- `onReplyWithPhoto?` – custom photo sending
- `contentDir?` – path to content folder

Inline buttons can use `callbackData` independently of command routing. During callback handling,
`ctx.callback` provides normalized data, the source message ID, `answer(text?)`, and
`editMessage(message, options?)`. The adapter acknowledges the callback automatically if the
handler does not answer it explicitly.

```ts
const bot = createUniversalTelegramBot({
  token: '...',
  commands: {},
  buttons: [],
  onCallback: async (ctx) => {
    const callback = ctx.callback;
    if (!callback) return;

    await callback.answer('Received');
    await callback.editMessage('Updated', {
      inlineKeyboard: [[{ label: 'Continue', callbackData: 'continue' }]],
    });
  },
});
```

## Middleware

- `database` is optional. Pass a database integration such as `createPostgresDatabase(pool)` when user persistence and command logging are needed.
- `loggerMiddleware` – logs incoming messages

## License

Apache-2.0
