import { describe, it, expect } from 'vitest';
import { mdOpts } from './mdOpts.js';

describe('mdOpts', () => {
  it('should return MarkdownV2 parse mode for Telegram', () => {
    expect(mdOpts('telegram')).toEqual({ parse_mode: 'MarkdownV2' });
  });

  it('should return empty object for VK', () => {
    expect(mdOpts('vk')).toEqual({});
  });
});
