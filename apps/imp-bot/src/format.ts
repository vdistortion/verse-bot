import type { Platform, RichMessage } from '@verse-bot/core';
import { fmtRich } from 'tg-rich-messages';

type FormatValue = unknown;
export type BotFormat = (strings: TemplateStringsArray, ...values: FormatValue[]) => RichMessage;

function stripHtml(value: string): string {
  return value
    .replace(/<br\s*\/?>(?=\S)/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<\/?p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function renderValue(value: FormatValue): string {
  if (value === null || value === undefined || value === false) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.map(renderValue).join('');

  if (typeof value === 'object') {
    if ('toHTML' in value && typeof value.toHTML === 'function') {
      return stripHtml(value.toHTML());
    }
    if ('render' in value && typeof value.render === 'function') {
      return stripHtml(value.render());
    }
  }

  return String(value);
}

function plainFormat(strings: TemplateStringsArray, ...values: FormatValue[]): string {
  return strings.reduce(
    (result, string, index) => result + string + (index < values.length ? renderValue(values[index]) : ''),
    '',
  );
}

export function formatFor(platform: Platform): BotFormat {
  return platform === 'telegram' ? (fmtRich as BotFormat) : plainFormat;
}
