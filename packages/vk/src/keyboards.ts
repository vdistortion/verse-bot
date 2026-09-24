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
      color: btn.color ?? 'primary',
    })),
  );
  return JSON.stringify({ one_time: oneTime, buttons });
}

export function createVKInlineKeyboard(buttonRows: UniversalKeyboardButton[][]): string {
  const buttons = buttonRows.map((row) =>
    row.map((btn) => ({
      action: {
        type: 'callback',
        label: btn.label,
        payload:
          btn.callbackData !== undefined
            ? JSON.stringify({ callbackData: btn.callbackData })
            : JSON.stringify({ command: btn.command ?? btn.label }),
      },
      color: btn.color ?? 'primary',
    })),
  );
  return JSON.stringify({ inline: true, buttons });
}
