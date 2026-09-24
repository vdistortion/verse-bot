import type { RichMessage } from '@verse-bot/core';
import type { RichDocument } from 'tg-rich-messages';
import type { BotFormat } from './format.js';

export function concatRich(fmt: BotFormat, parts: readonly RichMessage[]): RichMessage {
  const formatted = parts.map((part) => (typeof part === 'string' ? fmt`${part}` : part));

  if (formatted.every((part): part is string => typeof part === 'string')) {
    return formatted.join('');
  }

  return {
    toHTML: () =>
      formatted
        .map((part) => (part as RichDocument).toHTML())
        .join('')
        .replace(/<\/p>\s*<p>/gi, ''),
  };
}
