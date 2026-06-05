# Project Structure

```text
/
├── apps/
│   └── imp-bot/                 # Example bot (uses the framework)
├── packages/
│   ├── core/                    # @verse-bot/core – types, context, middleware
│   ├── db/                      # @verse-bot/db – PostgreSQL helpers, migrations
│   ├── shared/                  # @verse-bot/shared – unified re-export for users
│   ├── md-format/               # @verse-bot/md-format – message formatting
│   ├── tg-core/                 # @verse-bot/tg-core – Telegram adapter (GrammY)
│   ├── vk-core/                 # @verse-bot/vk-core – VK adapter (Long Poll API)
│   ├── miniapp/                 # @verse-bot/miniapp – Telegram Mini App utilities
│   └── create-verse-bot/        # CLI for generating new projects
└── docs/                        # Documentation (VitePress)
```

Commands in `apps/imp-bot/src/commands/` receive a `UniversalContext` and are platform-agnostic – the same handler runs on both Telegram and VK.
