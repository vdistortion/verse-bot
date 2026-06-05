import type { UniversalKeyboardButton } from '@verse-bot/core';

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
      color: 'primary',
    })),
  );
  return JSON.stringify({ one_time: oneTime, buttons });
}

export function createVKInlineKeyboard(buttonRows: UniversalKeyboardButton[][]): string {
  const buttons = buttonRows.map((row) =>
    row.map((btn) => ({
      action: {
        type: 'text',
        label: btn.label,
        payload: btn.command ? JSON.stringify({ command: btn.command }) : undefined,
      },
      color: 'primary',
    })),
  );
  return JSON.stringify({ inline: true, buttons });
}
