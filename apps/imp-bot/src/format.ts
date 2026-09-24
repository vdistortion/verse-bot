import type { Platform, RichMessage } from '@verse-bot/core';
import { fmtRich, inline, type FmtValue } from 'tg-rich-messages';

type FormatValue = unknown;
export type BotFormat = (strings: TemplateStringsArray, ...values: FormatValue[]) => RichMessage;

export const lineBreak = () => inline(() => '\n');

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value: string): string {
  return value
    .replace(
      /<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
      (_match, href: string, inner: string) => {
        const text = stripHtml(inner).trim();
        const url = decodeHtmlEntities(href);
        return text ? `[${url}|${text}]` : url;
      },
    )
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p\b[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
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
    (result, string, index) =>
      result + string + (index < values.length ? renderValue(values[index]) : ''),
    '',
  );
}

function richFormat(strings: TemplateStringsArray, ...values: FormatValue[]): RichMessage {
  const parts: FmtValue[] = [];

  const appendText = (text: string) => {
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      parts.push(line);
      if (index < lines.length - 1) parts.push(lineBreak());
    });
  };

  const appendValue = (value: FormatValue): void => {
    if (typeof value === 'string') {
      appendText(value);
    } else if (Array.isArray(value)) {
      value.forEach(appendValue);
    } else {
      parts.push(value as FmtValue);
    }
  };

  strings.forEach((string, index) => {
    appendText(string);
    if (index < values.length) appendValue(values[index]);
  });

  return fmtRich`${parts as unknown as FmtValue}`;
}

export function formatFor(platform: Platform): BotFormat {
  return platform === 'telegram' ? richFormat : plainFormat;
}
