# Project Structure

\`\`\`
/
├── apps/
│ └── bot/ # Example bot application
├── packages/
│ ├── tg-core/ # Telegram adapter (GrammY)
│ ├── vk-core/ # VK adapter (custom fetch client)
│ ├── shared/ # UniversalContext, DB, formatting
│ └── miniapp/ # Telegram Mini App utilities
└── docs/
\`\`\`

Commands in `apps/bot/src/commands/` receive a `UniversalContext` and are
platform-agnostic — the same handler runs on both Telegram and VK.
