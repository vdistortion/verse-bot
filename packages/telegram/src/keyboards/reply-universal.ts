import { Keyboard } from 'grammy';
import type { UniversalKeyboardButton } from '@verse-bot/core';

export function createTelegramKeyboard(
  universalKeyboard: UniversalKeyboardButton[][],
  resize: boolean = true,
  oneTime: boolean = false,
): Keyboard {
  const keyboard = new Keyboard([]);

  universalKeyboard.forEach((row) => {
    keyboard.row(...row.map((btn) => Keyboard.text(btn.label)));
  });

  if (resize) keyboard.resized();
  if (oneTime) keyboard.oneTime();

  return keyboard;
}
