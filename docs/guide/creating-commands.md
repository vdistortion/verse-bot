# Creating Commands

Команды в Verse – это асинхронные функции, принимающие `UniversalContext`. Они хранятся в `apps/bot/src/commands/` и регистрируются в фабриках ботов.

## Простая команда

Создайте файл `apps/bot/src/commands/hello.ts`:

```ts
import type { UniversalContext } from '@verse/shared';

export async function helloCommand(ctx: UniversalContext) {
  await ctx.reply(ctx.format`Привет, ${ctx.firstName ?? 'гость'}!`);
}
```

Добавьте её в `apps/bot/src/commands/index.ts`:

```ts
export { helloCommand } from './hello';
```

Затем зарегистрируйте в `apps/bot/src/index.ts` (в объекте `commands` фабрики) и кнопку (если нужна).

## Форматирование

Используйте тегированный шаблон `ctx.format`, который автоматически экранирует MarkdownV2 для Telegram и оставляет обычный текст для VK. Можно использовать токены:

```ts
ctx.format`${bold('Жирный текст')}`;
ctx.format`${link('Нажми', 'https://example.com')}`;
```

## Изображения

Если бот должен отправлять фото, можно использовать `ctx.replyWithPhoto` (может отсутствовать, проверьте через `if (ctx.replyWithPhoto)`).

## Клавиатуры

Для создания клавиатур используйте:

- Telegram: `createTelegramKeyboard` из `@verse/tg-core`.
- VK: `createVKKeyboard` из `@verse/shared`.

Примеры смотрите в команде startCommand.
