# Architecture

Verse Bot Framework построен на универсальном контексте (`UniversalContext`) и адаптерах для Telegram и VK. Одна команда пишется один раз и работает на обеих платформах.

## UniversalContext

`UniversalContext` – это интерфейс, скрывающий различия между Telegram API и VK API. Команды получают объект контекста, через который они могут:

- отвечать пользователю (`reply`, `replySafe`)
- получать информацию о сообщении (`text`, `userId`, `chatType`)
- проверять права (`isAdmin`)
- работать с БД (`db`)
- отправлять клавиатуры и фото

## Адаптеры

- **@verse-bot/telegram** — создаёт бота на [GrammY](https://grammy.dev/), преобразует входящие обновления в `UniversalContext`, регистрирует команды.
- **@verse-bot/vk** — собственный клиент VK API (Long Poll), создаёт контекст и подписывается на события.

## Фабрики универсальных ботов

Функции `createUniversalTelegramBot` и `createUniversalVKBot` скрывают весь шаблонный код: middleware аутентификации, логирование, регистрацию команд. Достаточно передать список обработчиков команд и кнопок.

```ts
const tgBot = createUniversalTelegramBot({
  token: '...',
  commands: { start: startCommand },
  buttons: [{ command: 'start', label: 'Начать' }],
});
tgBot.start();
```

## Жизненный цикл сообщения

- Входящее обновление от Telegram / VK.
- Адаптер создаёт `UniversalContext`.
- Если передан `database`, middleware проверяет существование пользователя в БД и создаёт запись при `/start`.
- При подключённом `database` команда логируется в `command_logs`.
- Вызывает соответствующий обработчик команды.
- Обработчик использует методы контекста для ответа.

Таким образом, команды не зависят от платформы.
