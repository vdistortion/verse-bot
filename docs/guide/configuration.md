# Configuration

## Environment variables

Copy `.env.example` to `.env` and fill in the values:

| Variable             | Description                    | Required                                           |
| -------------------- | ------------------------------ | -------------------------------------------------- |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token             | For Telegram                                       |
| `VK_GROUP_TOKEN`     | VK group token                 | For VK                                             |
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
- `commands` — a map of command names to handlers;
- `buttons` — button definitions with `command` and `label`;
- `onCallback` — optional handler for raw Telegram callback data when a button carries more than a command;
- `contentCommand` and `userLogCommand` — optional dynamic command handlers;
- `database` — optional `BotDatabase` integration;
- `onReplyWithPhoto` and `contentDir` — optional content delivery settings;
- `unknownCommandPhrase` and `getButtonsForUnknown` — optional unknown-command response settings.

### `VKBotConfig`

- `token`, `groupId` and optional `adminId`;
- `commands` and `buttons`, shared with Telegram;
- `onCallback` — optional handler for raw VK callback payloads when a button carries more than a command;
- `contentCommand` and `userLogCommand` — optional dynamic command handlers;
- `database` — optional `BotDatabase` integration;
- `onReplyWithPhoto`, `unknownCommandPhrase` and `getButtonsForUnknown` — optional response settings.

Both factories provide the shared behavior while leaving platform-specific API details inside their adapters.
