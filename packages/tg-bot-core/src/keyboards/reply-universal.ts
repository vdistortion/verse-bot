import { Keyboard } from 'grammy';
import type { UniversalKeyboardButton } from '@scope/shared';

export function createTelegramKeyboard(
  universalKeyboard: UniversalKeyboardButton[][],
  resize: boolean = true,
  oneTime: boolean = false,
): Keyboard {
  const keyboard = new Keyboard();

  for (const row of universalKeyboard) {
    for (const btn of row) {
      keyboard.text(btn.label);
    }
    keyboard.row();
  }

  if (resize) keyboard.resized();
  if (oneTime) keyboard.oneTime();

  return keyboard;
}
