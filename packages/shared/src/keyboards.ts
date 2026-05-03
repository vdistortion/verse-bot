import type { Platform } from './universal-context';

export interface UniversalKeyboard {
  label: string;
  command?: string;
}

export function createUniversalKeyboard(
  platform: Platform,
  fullMenu: boolean,
  isAdmin: boolean,
  isPrivate: boolean,
): UniversalKeyboard[][] {
  const keyboard: UniversalKeyboard[][] = [];

  keyboard.push([
    { label: 'Котики 🐾', command: '/cat' },
    { label: 'Цитаты 💬', command: '/quote' },
  ]);

  if (fullMenu) {
    keyboard.push([
      { label: 'Советы 💡', command: '/advice' },
      { label: 'Рандом 🎲', command: '/random' },
    ]);
  }

  const helpRow: UniversalKeyboard[] = [{ label: 'Справка ❓', command: '/help' }];
  if (isAdmin && isPrivate) {
    helpRow.push({ label: 'Админ 👑', command: '/admin' });
  }
  keyboard.push(helpRow);

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
