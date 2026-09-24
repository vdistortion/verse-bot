# @verse-bot/vk

VKontakte adapter (Long Poll API) for Verse Bot Framework.

## Install

```bash
npm install @verse-bot/vk
```

## Usage

```ts
import { createUniversalVKBot } from '@verse-bot/vk';
import { createPostgresDatabase, getPool } from '@verse-bot/postgres';

const bot = createUniversalVKBot({
  token: '...',
  groupId: 123456789,
  database: createPostgresDatabase(getPool()),
  commands: {
    start: async (ctx) => {
      await ctx.reply('Hello!');
    },
  },
  buttons: [{ command: 'start', label: 'Start' }],
});

bot.start();
```

Inline keyboard buttons are handled through VK `message_event` callbacks. Their command payload is dispatched through the same command handlers as text messages, and the callback is acknowledged automatically.

When a `RenderableMessage` is sent, HTTPS links are rendered as `Label: URL` so the external address is visible and clickable. VK-native links use VK markup in the form `[target|label]`.

## API

`createUniversalVKBot(config: VKBotConfig)` returns a `VKBot` instance.

### VKBotConfig

- `token` – group token
- `groupId` – group ID
- `adminId?` – VK admin ID
- `database?` – optional database integration, for example `createPostgresDatabase(pool)` from `@verse-bot/postgres`
- `commands`, `buttons` – same as Telegram
- `onCallback?` – handler for raw VK callback payloads when a button carries more than a command
- `contentCommand?`, `userLogCommand?`
- `onReplyWithPhoto?`
- `unknownCommandPhrase?`, `getButtonsForUnknown?`

## VKBot

Exposes `request(method, params)` for VK API calls and `sendMessage`. The underlying
`api`, `upload`, and `updates` clients are also available for platform-specific
operations such as album synchronization or custom Long Poll handlers.

## License

Apache-2.0
