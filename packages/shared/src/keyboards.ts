import type { Platform } from './universal-context';

export interface UniversalKeyboardButton {
  label: string;
  command?: string;
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
