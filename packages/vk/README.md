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

Callback handlers can read normalized data from `ctx.callback.data`, answer with an optional
snackbar, and edit the callback's source message using `ctx.callback.editMessage(...)`. Inline
buttons use VK callback actions; set `callbackData` for application-specific callback values and
`color` for VK button colors.

When a `RenderableMessage` is sent, HTTPS links are rendered as `Label: URL` so the external address is visible and clickable. VK-native links use VK markup in the form `[target|label]`.

## API

`createUniversalVKBot(config: VKBotConfig)` returns a `VKBot` instance.

### VKBotConfig

- `token` – group token
- `userToken?` – optional second VK API token, available as `bot.userApi` for API operations
  requiring separate credentials
- `groupId` – group ID
- `adminId?` – VK admin ID
- `checkAdmin?` – optional asynchronous check for community managers or extra administrators
- `database?` – optional database integration, for example `createPostgresDatabase(pool)` from `@verse-bot/postgres`
- `commands`, `buttons` – same as Telegram
- `onCallback?` – handler for raw VK callback payloads when a button carries more than a command
- `contentCommand?`, `userLogCommand?`
- `onReplyWithPhoto?`
- `unknownCommandPhrase?`, `getButtonsForUnknown?`
- `onMessage?` – fallback for incoming updates not handled by registered commands

## VKBot

Exposes `request(method, params)` for VK API calls and `sendMessage`. The underlying
`api`, optional `userApi`, `upload`, and `updates` clients are also available for platform-specific
operations such as album synchronization or custom Long Poll handlers.

`replyWithPhoto` also accepts a VK photo attachment ID such as `photo-123_456`; the adapter sends
it directly without attempting a URL download or upload.

## License

Apache-2.0
