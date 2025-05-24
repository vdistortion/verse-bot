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
  unknownCommand: (name: string) => string;
  defaultStartMessage: string;
  groupStartMessage: (title: string) => string;
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
  cat: '🐾 Муа! 🐾',
  quote: '💬 Крутая цитата',
  advice: '🧨 Отмочить',
};

const commandDescriptions: CommandDescriptionsType = {
  start: 'Если что-то пошло не так',
  stop: 'Убрать клавиатуру',
  help: 'Список возможных команд',
  location: '📍 Погода по геолокации',
  flags: 'Угадай страну 🚩',
  cat: 'За котиком! 🧶',
  quote: 'Умное слово 🗯',
};

const description = (commands: CommandsType) => `Команды:
/${commands.start.command} — ${commands.start.description}
/${commands.flags.command} — ${commands.flags.description}
/${commands.cat.command} — ${commands.cat.description}
/${commands.quote.command} — ${commands.quote.description}
/${commands.help.command} — ${commands.help.description}
/${commands.stop.command} — ${commands.stop.description}
${commands.location.description}

Исходный код:
${homepage}`;

const help = (commands: CommandsType) => `
/${commands.start.command} — ${commands.start.description}
/${commands.flags.command} — ${commands.flags.description}
/${commands.cat.command} — ${commands.cat.description}
/${commands.quote.command} — ${commands.quote.description}
/${commands.stop.command} — ${commands.stop.description}
${commands.location.description}`;

const unknownCommand = (name: string) => `${name}, не понимаю тебя! 😈
Возможно, кнопка не сработала.
Попробуй отправить команду /start для обновления меню.`;

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

${getEmoji(answer.main.temp)} _Температура_: ${answer.main.temp} ℃
🤔 _Ощущается как_: ${answer.main.feels_like} ℃
💧 _Влажность_: ${answer.main.humidity}%
📈 _Давление_: ${answer.main.pressure} мм рт. ст.
${answer.wind.speed > 0 ? `💨 _Ветер_: ${answer.wind.speed} м/с` : '🟦 _Штиль_'}`;
};

export const ru: LangType = {
  webApp: '🌐 Открыть сайт FlagConnect',
  about: 'Бот отправляет погоду и котиков 🐈\nА ещё цитаты и ценные советы 🤭',
  description,
  help,
  unknownCommand,
  defaultStartMessage: 'Держи клавиатуру! 😈',
  groupStartMessage: (title: string) => `Привет, чат *${title}*! 😈`,
  aliasStartMessage: (alias: string) => `Будь как дома, *${alias}*! 😈`,
  privateStartMessage: (name: string) => `Будь как дома, путник *${name}*! 😈`,
  stopCommand: 'Stopped',
  locationAnswer,
  buttonLabel: (button: keyof ButtonLabelsType) => buttonLabels[button],
  commandDescription: (command: keyof CommandDescriptionsType) => commandDescriptions[command],
  flagSettings: '⚠️ Настройки нестабильны\nСколько должно быть вариантов ответа?',
  flagSettingsEmpty: 'Без вариантов',
  flagEmptyAnswer: 'Показать ответ',
  flagAnswer: 'Какая это страна?',
  flagsMore: 'Продолжить',
  flagsSuccessAnswer: (name: string) => `☑️ Правильно, это ${name}`,
  flagsSuccessEmptyAnswer: (name: string) => `Это ${name}`,
  flagsErrorAnswer: (errorName: string, name: string) =>
    `Вы ответили ${errorName}.\n❌ Неправильно, это ${name}`,
  catNotFound: 'Кот убежал в сервера. Попробуй позже 🐾',
};
