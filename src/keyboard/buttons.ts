import type { KeyboardButton } from '@grammyjs/types/markup';
import { commands } from '../core';

const locationButton: KeyboardButton = {
  text: commands.location.description,
  request_location: true,
};

export const getKeyboard = (advice?: boolean): KeyboardButton[][] => {
  return [
    advice ? [commands.advice.text, commands.quote.text] : [commands.quote.text],
    [locationButton, commands.cat.text],
    [commands.flags.text],
  ];
};
