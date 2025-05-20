import { Keyboard } from 'grammy';
import type { KeyboardButton } from '@grammyjs/types/markup';
import { commands } from '../core';

const getButtons = (buttons: string[][]): KeyboardButton[][] =>
  buttons.map((row) => row.map((button) => Keyboard.text(button)));

export const getKeyboard = (advice?: boolean): KeyboardButton[][] => {
  return getButtons([
    advice ? [commands.advice.text, commands.quote.text] : [commands.quote.text],
    [commands.cat.text],
  ]);
};
