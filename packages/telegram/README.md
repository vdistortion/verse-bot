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
- `contentCommand?` – handler for `/content_<N>`
- `userLogCommand?` – handler for `/userlog_<N>`
- `unknownCommandPhrase?`, `getButtonsForUnknown?` – optional response for unknown private-chat messages
- `onReplyWithPhoto?` – custom photo sending
- `contentDir?` – path to content folder

## Middleware

- `database` is optional. Pass a database integration such as `createPostgresDatabase(pool)` when user persistence and command logging are needed.
- `loggerMiddleware` – logs incoming messages

## License

Apache-2.0
