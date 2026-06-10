# @verse-bot/format

Platform-aware message formatting utilities (Telegram MarkdownV2 / VK).

## Install

```bash
npm install @verse-bot/format
```

## Usage

```ts
import { format, bold, link } from '@verse-bot/format';

const fmt = format('telegram');
const msg = fmt`Hello ${bold('world')}! ${link('Click', 'https://example.com')}`;
// Telegram: Hello *world*! [Click](https://example.com)
// VK: Hello world! Click: https://example.com
```

## API

- `format(platform: Platform)` – creates a tagged template literal that escapes MarkdownV2 for Telegram and leaves plain text for VK.
- `escapeMarkdownV2(text: string): string` – escapes all characters that must be escaped in MarkdownV2.
- Tokens: `bold`, `link`, `raw`, `spoiler` – render differently depending on the platform.
- `Platform = 'telegram' | 'vk'`
