import type { Platform } from '@verse-bot/md-format';
import type { UniversalReplyOptions } from '@verse-bot/core';

export function mdOpts(platform: Platform): UniversalReplyOptions {
  return platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {};
}
