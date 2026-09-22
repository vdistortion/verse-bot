# Project Structure

```text
/
├── apps/
│   └── imp-bot/                 # Example bot (uses the framework)
├── packages/
│   ├── core/                    # @verse-bot/core – types, context, middleware
│   ├── postgres/                # @verse-bot/postgres – PostgreSQL helpers, migrations
│   ├── telegram/                # @verse-bot/telegram – Telegram adapter (GrammY)
│   ├── vk/                      # @verse-bot/vk – VK adapter (Long Poll API)
│   ├── miniapp/                 # @verse-bot/miniapp – Telegram Mini App utilities
│   └── create-verse-bot/        # CLI for generating new projects
└── docs/                        # Documentation (VitePress)
```

Commands in `apps/imp-bot/src/commands/` receive a `UniversalContext` and are platform-agnostic – the same handler runs on both Telegram and VK.
