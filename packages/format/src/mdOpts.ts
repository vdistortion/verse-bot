import type { Platform, UniversalReplyOptions } from '@verse-bot/core';

export function mdOpts(platform: Platform): UniversalReplyOptions {
  return platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {};
}
