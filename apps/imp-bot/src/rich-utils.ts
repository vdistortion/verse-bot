import type { FormatFn, RichMessage } from '@verse-bot/core';
import { doc, type RichDocument } from 'tg-rich-messages';

export function concatRich(fmt: FormatFn, parts: readonly RichMessage[]): RichDocument {
  return doc(
    ...parts.flatMap((part) => {
      const rich = typeof part === 'string' ? fmt`${part}` : part;
      return [...rich.blocks];
    }),
  );
}
