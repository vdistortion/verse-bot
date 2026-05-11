import type { Platform } from './universal-context';

export interface UniversalKeyboardButton {
  label: string;
  command?: string;
}

export function createUniversalKeyboard(
  platform: Platform,
  buttonRows: UniversalKeyboardButton[][],
): UniversalKeyboardButton[][] {
  // можно что-то делать с platform (например, для VK не добавлять какие-то кнопки), но пока просто возвращаем
  return buttonRows;
}

export function createVKKeyboard(
  buttonRows: UniversalKeyboardButton[][],
  oneTime: boolean = false,
): string {
  const buttons = buttonRows.map((row) =>
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
