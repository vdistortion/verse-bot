import type { Platform } from '@verse/md-format';
import type { UniversalReplyOptions } from '../universal-context.js';

export function mdOpts(platform: Platform): UniversalReplyOptions {
  return platform === 'telegram' ? { parse_mode: 'MarkdownV2' } : {};
}
