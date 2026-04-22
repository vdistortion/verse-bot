import type { Platform } from './universal-context';

export interface UniversalKeyboard {
  label: string;
  command?: string; // Для команд, которые отправляются как текст
  callbackData?: string; // Для inline-кнопок или payload в VK
  requestLocation?: boolean; // Для кнопки запроса геолокации (только TG)
  hide?: boolean; // Скрыть кнопку
}

export function createUniversalKeyboard(
  platform: Platform,
  fullMenu: boolean,
): UniversalKeyboard[][] {
  const keyboard: UniversalKeyboard[][] = [];

  // Основные кнопки
  keyboard.push([
    { label: 'Котики 🐾', command: '/cat' },
    { label: 'Цитаты 💬', command: '/quote' },
  ]);

  // Дополнительные кнопки для полного меню
  if (fullMenu) {
    keyboard.push([
      { label: 'Советы 💡', command: '/advice' },
      { label: 'Рандом 🎲', command: '/random' },
    ]);
  }

  // Добавим кнопки /id и /stop, они всегда доступны
  keyboard.push([
    { label: 'Мой ID 🆔', command: '/id' },
    { label: 'Стоп 🛑', command: '/stop' },
  ]);

  return keyboard;
}

export function createVKKeyboard(
  universalKeyboard: UniversalKeyboard[][],
  oneTime: boolean = false,
): string {
  const buttons = universalKeyboard.map((row) =>
    row.map((btn) => ({
      action: {
        type: 'text',
        label: btn.label,
        payload: btn.command ? JSON.stringify({ command: btn.command }) : undefined,
      },
      color: 'primary', // Можно настроить цвета по желанию
    })),
  );

  return JSON.stringify({ one_time: oneTime, buttons });
}
