import { keyboardButtons } from './buttons';
import { chunk } from '../utils/chunkArray';

const names = [keyboardButtons.quote, keyboardButtons.advice].map((button) => button.title);

export const keyboard = chunk(names, 2);
export { keyboardButtons };
