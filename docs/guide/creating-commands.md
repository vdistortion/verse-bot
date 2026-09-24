# Creating Commands

Commands are asynchronous functions that receive a `UniversalContext`. Keep them in `src/commands/` and register them in the bot factory configuration.

## A simple command

Create `src/commands/hello.ts`:

```ts
import type { UniversalContext } from '@verse-bot/core';

export async function helloCommand(ctx: UniversalContext): Promise<void> {
  await ctx.reply('Hello!');
}
```

Register it in the command map:

```ts
const commands = {
  hello: helloCommand,
};
```

Pass the map to both platform factories when the command should work on Telegram and VK.

## Formatting

`@verse-bot/core` accepts strings and neutral `RichMessage` values. Telegram formatting and rich-message conversion remain the responsibility of the application, so a shared command can start with a plain string:

```ts
await ctx.reply('Hello!');
```

For rich Telegram messages, use [`tg-rich-messages`](https://www.npmjs.com/package/tg-rich-messages), a platform-independent HTML message builder. The source code and examples are available on [GitHub](https://github.com/vdistortion/tg-rich-messages). It is the successor to the earlier `@verse-bot/md-format` package and is intentionally kept outside the engine.

## Images and files

Use `ctx.replyWithPhoto` on either built-in adapter. `ctx.replyWithFile` is an optional capability;
check that it exists before sending files. Telegram supports it through the Bot API, while VK
document uploads require an additional API scope.

## Keyboards

Use the platform helpers when you need a native keyboard:

- Telegram: `createTelegramKeyboard` or `createTelegramInlineKeyboard` from `@verse-bot/telegram`;
- VK: `createVKKeyboard` or `createVKInlineKeyboard` from `@verse-bot/vk`.

Adapter `buttons` and `getButtonsForUnknown` share the `UniversalCommandButton[]` shape (`command` and
`label`). For reply and inline keyboards, pass `UniversalKeyboardButton[][]` through the context
options and let the adapter render it for the target platform.

Inline buttons may provide `callbackData` for application-specific values and `color` for VK
button colors. In an `onCallback` handler, use `ctx.callback` to access normalized callback data,
answer the callback, or edit the source message. Unanswered callbacks are acknowledged by the
adapter automatically.

Use `onMessage` for incoming updates that do not match a registered command or button, such as
plain-text links sent to an admin. When `onMessage` is configured, it takes precedence over the
adapter's generic unknown-message response. `checkAdmin` accepts an asynchronous callback when
administrator status comes from platform roles rather than a single configured user ID.
