import { InlineKeyboard } from 'grammy';
import type { UniversalKeyboardButton } from '@verse-bot/core';

export function createTelegramInlineKeyboard(
  universalKeyboard: UniversalKeyboardButton[][],
): InlineKeyboard {
  const inlineKeyboard = new InlineKeyboard();

  for (const row of universalKeyboard) {
    const rowButtons = row.map((btn) =>
      InlineKeyboard.text(btn.label, btn.command ? btn.command : btn.label),
    );
    inlineKeyboard.row(...rowButtons);
  }

  return inlineKeyboard;
}
