# create-verse-bot

CLI to scaffold a new [Verse Bot Framework](https://github.com/vdistortion/verse-bot) project.

## Quick Start

```bash
npm create verse-bot@latest
# or
npx create-verse-bot
```

The wizard will ask for a project name and target platforms (Telegram, VK).  
It then copies the template, installs dependencies, and sets up scripts.

## Usage

```bash
cd your-bot
cp .env.example .env   # fill in your tokens
npm run dev            # start in dev mode
```

## Flags

- `--local` – use local package references (`file:`) instead of published versions.  
  Useful when developing the framework itself.

## Generated project structure

- `src/index.ts` – entry point, bot initialization
- `src/env.ts` – typed environment variables
- `compose.yaml`, `compose.release.yaml` – dev and production containers
- `.env.example` – environment variables template
