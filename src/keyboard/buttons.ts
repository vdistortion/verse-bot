import { Markup } from 'telegraf';
import type { KeyboardButton } from '@telegraf/types/markup';

export const ButtonTypes = {
  CAT: '🐈🐾🐾🐾',
  QUOTE: '🗯 Крутая цитата 🗯',
  ADVICE: '🔞 Отмочить 🔞',
  FLAGS: '🏴 Флаги 🏳️',
};

const getButtons = (buttons: string[][]): KeyboardButton[][] =>
  buttons.map((row) => row.map((button) => Markup.button.text(button)));

export const getKeyboard = (advice?: boolean): KeyboardButton[][] => {
  return getButtons([
    advice ? [ButtonTypes.ADVICE, ButtonTypes.QUOTE] : [ButtonTypes.QUOTE],
    [ButtonTypes.CAT],
  ]);
};
