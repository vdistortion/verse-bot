import type { KeyboardButton } from '@grammyjs/types/markup';
import { commands } from '../core';

const locationButton: KeyboardButton = {
  text: commands.location.description,
  request_location: true,
};

export const getKeyboard = (isPrivateChat?: boolean, advice?: boolean): KeyboardButton[][] => {
  return [
    advice
      ? [commands.advice.text, commands.flags.text, commands.cat.text]
      : [commands.flags.text, commands.cat.text],
    isPrivateChat ? [locationButton, commands.quote.text] : [commands.quote.text],
  ];
};
