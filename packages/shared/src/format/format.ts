import { escapeMarkdownV2 } from '@scope/tg-bot-core';
import { FormatToken } from './tokens';
import type { Platform } from '../universal-context';

export function format(platform: Platform) {
  return (strings: TemplateStringsArray, ...values: (string | FormatToken)[]): string => {
    let result = '';
    strings.forEach((str, i) => {
      result += str;
      if (i < values.length) {
        const val = values[i];
        if (val instanceof FormatToken) {
          result += val.render(platform);
        } else {
          // Это сырая строка – экранируем её для Telegram, для VK оставляем как есть
          result += platform === 'telegram' ? escapeMarkdownV2(val) : val;
        }
      }
    });
    return result;
  };
}
