import type { Context } from 'grammy';
import createDebug from 'debug';
import { buttons } from '../keyboard';
import { reply } from '../utils/reply';

const debug = createDebug('bot:help_command');

const help = () => async (ctx: Context) => {
  debug('Triggered "help" command');
  await reply(
    ctx,
    `
/start — Запуск/перезапуск бота
/${buttons.cat.command} — ${buttons.cat.description}
/${buttons.quote.command} — ${buttons.quote.description}
/help — Список возможных команд
Если отправить боту геопозицию, он ответит погодой
`,
  );
};

export { help };
