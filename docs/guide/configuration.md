# Configuration

## Переменные окружения

Скопируйте `.env.example` в `.env` и заполните:

| Переменная           | Описание                                | Обязательно?       |
| -------------------- | --------------------------------------- | ------------------ |
| `TELEGRAM_BOT_TOKEN` | Токен Telegram-бота                     | для TG             |
| `VK_GROUP_TOKEN`     | Токен группы ВКонтакте                  | для VK             |
| `VK_GROUP_ID`        | ID группы ВК                            | для VK             |
| `TELEGRAM_ADMIN_ID`  | Telegram ID администратора              | опционально        |
| `VK_ADMIN_ID`        | VK ID администратора                    | опционально        |
| `PUBLIC_URL`         | Публичный URL для статики (изображений) | опционально        |
| `CONTENT_DIR`        | Путь к папке с контентом                | `/srv/content/bot` |
| `POSTGRES_*`         | Параметры подключения к БД              | да                 |

## Параметры фабрик

**TelegramBotConfig**:

- `token` — строка
- `adminId` — number
- `commands` — объект «имя команды → функция-обработчик»
- `buttons` — массив `{ command, label }` для регистрации кнопок
- `contentCommand`, `userLogCommand` — опциональные обработчики динамических команд
- `onReplyWithPhoto` — можно переопределить отправку фото
- `contentDir` — папка для поиска локальных изображений

**VKBotConfig**:

- `token`, `groupId`, `adminId`
- `commands`, `buttons` (аналогично TG)
- `contentCommand`, `userLogCommand`
- `onReplyWithPhoto`
- `pool` — пул БД (обязательно)
- `unknownCommandPhrase`, `getButtonsForUnknown` — для ответа на нераспознанные сообщения

Оба конфига позволяют гибко настраивать поведение без правки исходников фреймворка.
