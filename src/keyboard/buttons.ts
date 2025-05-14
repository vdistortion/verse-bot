import { Markup } from 'telegraf';

export const enum ButtonTypes {
  CAT = '🐈 Вызвать котиков 🐈',
  QUOTE = '🗯 Крутая цитата 🗯',
  ADVICE = '🔞 Отмочить 🔞',
}

export const getKeyboard = (advice?: boolean) => {
  if (advice) {
    return [
      [Markup.button.text(ButtonTypes.ADVICE), Markup.button.text(ButtonTypes.QUOTE)],
      [Markup.button.text(ButtonTypes.CAT)],
    ];
  }

  return [[Markup.button.text(ButtonTypes.QUOTE)], [Markup.button.text(ButtonTypes.CAT)]];
};
