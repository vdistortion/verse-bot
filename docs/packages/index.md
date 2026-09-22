# Packages

Verse Bot is split into independent packages. Install only the integrations that your application uses.

| Package                                          | Purpose                                                           |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| [`@verse-bot/core`](/packages/core)              | Platform-neutral context, types, command dispatch and guards.     |
| [`@verse-bot/postgres`](/packages/postgres)      | Optional PostgreSQL persistence and command logs.                 |
| [`@verse-bot/telegram`](/packages/telegram)      | Telegram adapter based on [grammY](https://grammy.dev/).          |
| [`@verse-bot/vk`](/packages/vk)                  | VK adapter based on [vk-io](https://github.com/negezor/vk-io).    |
| [`@verse-bot/miniapp`](/packages/miniapp)        | Telegram Mini App utilities with an optional Angular entry point. |
| [`create-verse-bot`](/packages/create-verse-bot) | Experimental CLI for scaffolding a bot project.                   |

The bot adapters depend on `@verse-bot/core`. PostgreSQL is optional and is passed to an adapter through the `database` option.

## ESM-only

The Node.js packages publish ESM entry points and do not provide a CommonJS build. The published packages contain compiled `dist` output and generated declarations; application source files stay in the repository.

## License

Apache-2.0
