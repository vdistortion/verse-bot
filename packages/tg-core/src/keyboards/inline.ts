import { InlineKeyboard } from 'grammy';

export interface InlineButton {
  text: string;
  data?: string; // callback_data
  url?: string; // внешняя ссылка
}

export function createInlineKeyboard(rows: InlineButton[][]): InlineKeyboard {
  const keyboard = new InlineKeyboard();

  for (const row of rows) {
    for (const btn of row) {
      if (btn.url) {
        keyboard.url(btn.text, btn.url);
      } else if (btn.data) {
        keyboard.text(btn.text, btn.data);
      }
    }
    keyboard.row();
  }

  return keyboard;
}
