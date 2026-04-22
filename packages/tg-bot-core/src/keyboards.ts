import { Keyboard } from 'grammy';
import type { UniversalKeyboard } from '@scope/shared';

export function createTelegramKeyboard(
  universalKeyboard: UniversalKeyboard[][],
  resize: boolean = true,
  oneTime: boolean = false,
): Keyboard {
  const keyboard = new Keyboard();

  for (const row of universalKeyboard) {
    for (const btn of row) {
      if (btn.requestLocation) {
        keyboard.requestLocation(btn.label);
      } else {
        keyboard.text(btn.label);
      }
    }
    keyboard.row();
  }

  if (resize) keyboard.resized();
  if (oneTime) keyboard.oneTime();

  return keyboard;
}
