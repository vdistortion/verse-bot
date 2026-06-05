# @verse-bot/vk-core

VKontakte adapter (Long Poll API) for Verse Bot Framework.

## Install

```bash
npm install @verse-bot/vk-core
```

## Usage

```ts
import { createUniversalVKBot } from '@verse-bot/vk-core';
import { getPool } from '@verse-bot/db';

const bot = createUniversalVKBot({
  token: '...',
  groupId: 123456789,
  pool: getPool(),
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

`createUniversalVKBot(config: VKBotConfig)` returns a `VKBot` instance.

### VKBotConfig

- `token` – group token
- `groupId` – group ID
- `adminId?` – VK admin ID
- `pool` – database pool (required)
- `commands`, `buttons` – same as Telegram
- `contentCommand?`, `userLogCommand?`
- `onReplyWithPhoto?`
- `unknownCommandPhrase?`, `getButtonsForUnknown?`

## VKBot

Exposes `request(method, params)` for VK API calls and `sendMessage`.
