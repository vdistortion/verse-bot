type KeyboardButtonsItemType = {
  id: string;
  title: string;
};

type KeyboardButtonsType = {
  advice: KeyboardButtonsItemType;
  quote: KeyboardButtonsItemType;
};

export const keyboardButtons: KeyboardButtonsType = {
  advice: {
    id: 'advice',
    title: 'Отмочить (18+)',
  },
  quote: {
    id: 'quote',
    title: 'Крутая цитата',
  },
};
