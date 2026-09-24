# Configuration

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable             | Description                    | Required                                           |
| -------------------- | ------------------------------ | -------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token             | For Telegram                                       |
| `VK_GROUP_TOKEN`     | VK group token                 | For VK                                             |
| `VK_USER_TOKEN`      | Optional second VK API token   | Optional                                           |
| `VK_GROUP_ID`        | VK group ID                    | With VK                                            |
| `TELEGRAM_ADMIN_ID`  | Telegram administrator ID      | Optional                                           |
| `VK_ADMIN_ID`        | VK administrator ID            | Optional                                           |
| `PUBLIC_URL`         | Public URL for static content  | Optional                                           |
| `POSTGRES_*`         | PostgreSQL connection settings | Required by the example app; optional for adapters |

At least one platform token must be configured. `VK_GROUP_ID` is required when `VK_GROUP_TOKEN` is set.

## Factory options

### `TelegramBotConfig`

- `token` — bot token;
- `adminId` — optional administrator ID;
- `checkAdmin` — optional asynchronous check for additional administrator roles;
- `commands` — a map of command names to handlers;
- `buttons` — command-to-label mappings;
- `onCallback` — optional handler for normalized callback data from inline buttons;
- `onMessage` — optional fallback for incoming updates not handled by a command or button;
- `contentCommand` and `userLogCommand` — optional dynamic command handlers;
- `database` — optional `BotDatabase` integration;
- `onReplyWithPhoto` and `contentDir` — optional content delivery settings;
- `unknownCommandPhrase` and `getButtonsForUnknown` — optional unknown-command response settings.

### `VKBotConfig`

- `token`, optional `userToken`, `groupId` and optional `adminId`;
- `checkAdmin` — optional asynchronous check for community manager roles or extra administrators;
- `commands` and `buttons`, shared with Telegram;
- `onCallback` — optional handler for normalized VK callback data; the original payload is available as `ctx.payload`;
- `onMessage` — optional fallback for incoming messages not handled by a command;
- `contentCommand` and `userLogCommand` — optional dynamic command handlers;
- `database` — optional `BotDatabase` integration;
- `onReplyWithPhoto`, `unknownCommandPhrase` and `getButtonsForUnknown` — optional response settings.

Both factories provide the shared behavior while leaving platform-specific API details inside their adapters. Callback contexts expose `data`, `messageId`, `answer(text?)` and `editMessage(message, options?)`; `onCallback` receives the normalized data string, while the original platform payload is available as `ctx.payload`. The photo hook receives `UniversalContext` in both adapters. The VK factory returns a bot with the group client as `api` and, when configured, the second authenticated client as `userApi`.

For inline keyboards built through `UniversalReplyOptions`, buttons may also set `callbackData`; VK buttons additionally support `color`.
