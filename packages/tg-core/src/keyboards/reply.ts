import { Keyboard } from 'grammy';

export interface ReplyButton {
  text: string;
  requestContact?: boolean;
  requestLocation?: boolean;
}

export function createReplyKeyboard(
  rows: ReplyButton[][],
  options?: { resize?: boolean; oneTime?: boolean },
): Keyboard {
  const keyboard = new Keyboard();

  for (const row of rows) {
    for (const btn of row) {
      if (btn.requestContact) {
        keyboard.requestContact(btn.text);
      } else if (btn.requestLocation) {
        keyboard.requestLocation(btn.text);
      } else {
        keyboard.text(btn.text);
      }
    }
    keyboard.row();
  }

  if (options?.resize) keyboard.resized();
  if (options?.oneTime) keyboard.oneTime();

  return keyboard;
}
