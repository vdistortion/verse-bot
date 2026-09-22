import type { RichMessage } from '@verse-bot/core';
import { doc, type RichDocument } from 'tg-rich-messages';
import type { BotFormat } from './format.js';

export function concatRich(fmt: BotFormat, parts: readonly RichMessage[]): RichMessage {
  const formatted = parts.map((part) => (typeof part === 'string' ? fmt`${part}` : part));

  if (formatted.every((part): part is string => typeof part === 'string')) {
    return formatted.join('');
  }

  return doc(
    ...formatted.flatMap((part) => {
      const rich = part as RichDocument;
      return [...rich.blocks];
    }),
  );
}
