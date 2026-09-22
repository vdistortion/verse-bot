# Architecture

Verse Bot is built around a platform-neutral `UniversalContext` and separate adapters for Telegram and VK. A command can be implemented once and used on both platforms.

## UniversalContext

`UniversalContext` hides the differences between the Telegram and VK APIs. Commands can use it to:

- reply to a user with `reply` or `replySafe`;
- inspect the message through `text`, `userId` and `chatType`;
- check permissions through `isAdmin`;
- access the optional database client through `db`;
- send keyboards, photos and files when the adapter supports them.

## Adapters

- **`@verse-bot/telegram`** creates a bot with [grammY](https://grammy.dev/), converts updates into `UniversalContext` and registers commands.
- **`@verse-bot/vk`** uses [vk-io](https://github.com/negezor/vk-io) for VK API access and Long Poll events, then converts them into `UniversalContext`.

Both adapters dispatch simple button commands through the shared command map. Use the platform adapter's optional `onCallback` handler when a callback carries additional platform-specific data.

## Universal bot factories

`createUniversalTelegramBot` and `createUniversalVKBot` hide the shared setup: authentication middleware, logging and command dispatch. Pass the command handlers and keyboard definitions that your application needs.

```ts
const telegramBot = createUniversalTelegramBot({
  token: '...',
  commands: { start: startCommand },
  buttons: [{ command: 'start', label: 'Start' }],
});

await telegramBot.start();
```

## Message lifecycle

1. Telegram or VK sends an update.
2. The adapter creates a `UniversalContext`.
3. If `database` is configured, the middleware creates or finds the user when appropriate.
4. The command is logged when persistence is enabled.
5. The matching command handler runs.
6. The handler replies through the context.

The command itself stays independent of the platform. Platform-specific differences remain in the adapters and in optional rendering code owned by the application.
