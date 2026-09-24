# `@verse-bot/vk`

VK bot adapter based on [vk-io](https://github.com/negezor/vk-io) and its Long Poll API.

## Install

```bash
npm install @verse-bot/vk
```

## Usage

```ts
import { createUniversalVKBot } from '@verse-bot/vk';

const bot = createUniversalVKBot({
  token: process.env.VK_GROUP_TOKEN!,
  groupId: Number(process.env.VK_GROUP_ID),
  commands: {
    start: async (ctx) => {
      await ctx.reply('Hello!');
    },
  },
  buttons: [],
});

await bot.start();
```

The adapter creates a universal context, manages Long Poll updates and renders shared keyboards and links for VK. PostgreSQL integration is optional through the `database` option.

Inline keyboard callbacks are handled through VK `message_event` updates and use the same command handlers as text messages.

Inline keyboards use VK callback actions, support `callbackData` and VK button `color`, and expose
normalized callback data plus `answer(text?)` and `editMessage(message, options?)` through
`ctx.callback`. Unanswered callbacks are acknowledged automatically. VK photo attachment IDs can
be passed to `ctx.replyWithPhoto` and are sent directly.

Use the optional `onCallback` configuration when a VK callback carries additional data such as an action or item identifier.

The returned `VKBot` also exposes `request`, `sendMessage`, and the underlying `api`, `upload`, and
`updates` clients for platform-specific operations. Configure `userToken` to expose an additional
`userApi` client when a scenario requires separate credentials, for example to read community photo
albums. `checkAdmin` supports asynchronous checks for VK community roles, and `onMessage` receives
messages not handled by registered commands.

## License

Apache-2.0
