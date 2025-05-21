type CommandsType = Record<
  'start' | 'stop' | 'help' | 'cat' | 'quote' | 'advice' | 'flags' | 'location',
  Record<'command' | 'text' | 'description', string>
>;

export const commands: CommandsType = {
  start: { command: 'start', text: '', description: 'Если что-то пошло не так' },
  stop: { command: 'stop', text: '', description: 'Убрать клавиатуру' },
  help: { command: 'help', text: '', description: 'Список возможных команд' },
  cat: { command: 'cat', text: '🐾 Муа! 🐾', description: 'За котиком! 🧶' },
  flags: { command: 'flag_connect', text: '🌍 Флаги', description: 'Угадай страну 🚩' },
  quote: { command: 'quote', text: '💬 Крутая цитата', description: 'Умное слово 🗯' },
  advice: { command: 'advice', text: '🧨 Отмочить', description: '' },
  location: { command: '', text: '', description: '📍 Погода по геолокации' },
};
