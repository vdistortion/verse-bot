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

The adapter creates a universal context, manages Long Poll updates and renders shared keyboards for VK. PostgreSQL integration is optional through the `database` option.

## License

Apache-2.0
