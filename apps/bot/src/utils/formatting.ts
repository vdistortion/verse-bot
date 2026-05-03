import type { Platform, UniversalReplyOptions } from '@scope/shared';
import { escapeMarkdownV2 } from '@scope/tg-bot-core';

export function esc(platform: Platform, text: string): string {
  return platform === 'telegram' ? escapeMarkdownV2(text) : text;
}

export function mdOpts(platform: Platform): UniversalReplyOptions {
  return platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {};
}
