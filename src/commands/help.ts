import type { Context } from 'telegraf';
import createDebug from 'debug';
import { reply } from '../utils/reply';

const debug = createDebug('bot:help_command');

const help = () => async (ctx: Context) => {
  debug('Triggered "help" command');
  await reply(
    ctx,
    `
/start — Запуск/перезапуск бота
/cat — Запросить котика
/quote — Цитата
/help — Список возможных команд
Если отправить боту геопозицию, он ответит погодой
`,
  );
};

export { help };
