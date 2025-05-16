import { Markup } from 'telegraf';

export const ButtonTypes = {
  CAT: '🐈 Вызвать котиков 🐈',
  QUOTE: '🗯 Крутая цитата 🗯',
  ADVICE: '🔞 Отмочить 🔞',
};

const getButtons = (advice?: boolean) => {
  if (advice) {
    return [
      [Markup.button.text(ButtonTypes.ADVICE), Markup.button.text(ButtonTypes.QUOTE)],
      [Markup.button.text(ButtonTypes.CAT)],
    ];
  }

  return [[Markup.button.text(ButtonTypes.QUOTE)], [Markup.button.text(ButtonTypes.CAT)]];
};

export const getKeyboard = (advice?: boolean) => {
  return {
    reply_markup: {
      keyboard: getButtons(advice),
      resize_keyboard: true,
    },
  };
};
