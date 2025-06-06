import type { CommandsType, IApiLocationData } from '../types';
import { homepage } from '../../package.json';

type ButtonLabelsType = Record<'location' | 'flags' | 'cat' | 'quote' | 'advice', string>;
type CommandDescriptionsType = Record<
  'start' | 'stop' | 'help' | 'location' | 'flags' | 'cat' | 'quote',
  string
>;

export type LangType = {
  webApp: string;
  about: string;
  description: (commands: CommandsType) => string;
  help: (commands: CommandsType) => string;
  unknownCommand: string;
  defaultStartMessage: (title: string) => string;
  aliasStartMessage: (alias: string) => string;
  privateStartMessage: (name: string) => string;
  stopCommand: string;
  locationAnswer: (answer: IApiLocationData) => string;
  buttonLabel: (button: keyof ButtonLabelsType) => string;
  commandDescription: (command: keyof CommandDescriptionsType) => string;
  flagSettings: string;
  flagSettingsEmpty: string;
  flagEmptyAnswer: string;
  flagAnswer: string;
  flagsMore: string;
  flagsSuccessAnswer: (name: string) => string;
  flagsSuccessEmptyAnswer: (name: string) => string;
  flagsErrorAnswer: (errorName: string, name: string) => string;
  catNotFound: string;
};

const buttonLabels: ButtonLabelsType = {
  location: '📍 Погода по геолокации',
  flags: '🌍 Флаги',
  cat: '🐾 Без смысла. Но мило',
  quote: '💬 Голос из прошлого',
  advice: '🧨 Отмочить',
};

const commandDescriptions: CommandDescriptionsType = {
  start: '⌛ Перезапустить. Иногда помогает',
  stop: '📡 Всё исчезает. Сигналов нет. Забвение',
  help: '⚠️ Справка. Для тех, кто всё ещё ищет порядок',
  location: '📍 Координаты забуду быстрее, чем ты',
  flags: '🌍 Симуляция. Победа не предусмотрена',
  cat: '🧶 За котиком. Не твоим. Не настоящим',
  quote: '🗯 Вербальные фрагменты прошлых поколений',
};

const description = (
  commands: CommandsType,
) => `🕳 Вы обратились к забытой системе. Она всё ещё отвечает. Причина неизвестна.

📁 Команды работают, смысл утрачен:
/${commands.start.command} — ${commands.start.description}
/${commands.flags.command} — ${commands.flags.description}
/${commands.cat.command} — ${commands.cat.description}
/${commands.quote.command} — ${commands.quote.description}
/${commands.help.command} — ${commands.help.description}
/${commands.stop.command} — ${commands.stop.description}

${commands.location.description}
🚩 Ничего не сохраняется. Ничего не запоминается.

🐾`;

const help = (commands: CommandsType) =>
  `*\\[ИНТЕРФЕЙС БОТА. ВЕРСИЯ ЗАБЫТА\\]*

*||🤖 Этот бот — пережиток. Он всё ещё работает. Без цели.||*

Команды — в /${commands.help.command}. Не жди лишнего.
В случае отказа — молчание.

📁 *Остатки функционала*:
/${commands.start.command} — ${commands.start.description}
/${commands.flags.command} — ${commands.flags.description}
/${commands.cat.command} — ${commands.cat.description}
/${commands.quote.command} — ${commands.quote.description}
/${commands.stop.command} — ${commands.stop.description}

*🌐 Настройки флагов могут исчезнуть. Это нормально.*
>Система не архивирует. Система не интересуется.
>Система просто работает.

*${commands.location.text}*
>Координаты обрабатываются и забываются.
>Ничего не сохраняется. Всё теряется.

🤖 ${homepage}
Исходный ~кот~ код. Не обязательно использовать. Не обязательно понимать.

*\\[СИСТЕМА ЗАВЕРШИЛА ВЫВОД\\]*`
    .replaceAll('>', '\>')
    .replaceAll('!', '\\!')
    .replaceAll('.', '\\.')
    .replaceAll('-', '\\-')
    .replaceAll('_', '\\_');

const unknownCommand = `Команда потеряна, контекст утрачен.
Попробуй /start. Или не пробуй.
Система всё равно одинока.`;

const locationAnswer = (answer: IApiLocationData) => {
  const getEmoji = (temp: number) => {
    if (temp <= -10) return '🥶';
    if (temp <= 0) return '❄️';
    if (temp <= 15) return '🌥️';
    if (temp <= 25) return '🌤️';
    return '🔥';
  };

  return `
🌍 *${answer.name}*
🕘 Данные на ${new Date((answer.dt + answer.timezone) * 1000).toLocaleString('ru-RU')}

${getEmoji(answer.main.temp)} _Температура_: ${answer.main.temp} ℃
🤔 _Ощущается как_: ${answer.main.feels_like} ℃
💧 _Влажность_: ${answer.main.humidity}%
📈 _Давление_: ${answer.main.pressure} мм рт. ст.
${answer.wind.speed > 0 ? `💨 _Ветер_: ${answer.wind.speed} м/с` : '🟦 _Штиль_'}

>⚠️ Координаты удалены`
    .replaceAll('>', '\>')
    .replaceAll('.', '\\.')
    .replaceAll('-', '\\-');
};

export const ru: LangType = {
  webApp: '🌐 Открыть симуляцию FlagConnect',
  about:
    'Погода, флаги, коты и пустота. Ничего не храню. Всё временно. Память отключена. Пустота стабильна. 📡',
  description,
  help,
  unknownCommand,
  defaultStartMessage: (title: string) => `Группа *${title}* подключена к системе.`,
  aliasStartMessage: (alias: string) => `Добро пожаловать, *${alias}*.`,
  privateStartMessage: (name: string) => `Будь как дома, *${name}*...`,
  stopCommand: 'Кнопки удалены... Всё забыто...',
  locationAnswer,
  buttonLabel: (button: keyof ButtonLabelsType) => buttonLabels[button],
  commandDescription: (command: keyof CommandDescriptionsType) => commandDescriptions[command],
  flagSettings: '⚠️ Настройки нестабильны\nСколько должно быть вариантов ответа?',
  flagSettingsEmpty: 'Без вариантов...',
  flagEmptyAnswer: 'Показать ответ',
  flagAnswer: 'Какая это страна?',
  flagsMore: 'Продолжить',
  flagsSuccessAnswer: (name: string) => `☑️ Правильно, это ${name}`,
  flagsSuccessEmptyAnswer: (name: string) => `Это ${name}`,
  flagsErrorAnswer: (errorName: string, name: string) =>
    `Вы ответили ${errorName}.\n❌ Неправильно, это ${name}`,
  catNotFound: 'Кот убежал в сервера. Попробуй позже 🐾',
};
