import { describe, it, expect } from 'vitest';
import { escapeMarkdownV2 } from './markdown.js';

describe('escapeMarkdownV2', () => {
  it('should escape special characters', () => {
    expect(escapeMarkdownV2('_*[]()~`>#+-=|{}.!')).toBe(
      '\\_\\*\\[\\]\\(\\)\\~\\`\\>\\#\\+\\-\\=\\|\\{\\}\\.\\!',
    );
  });

  it('should escape backslash itself', () => {
    expect(escapeMarkdownV2('\\')).toBe('\\\\');
  });

  it('should not modify normal text', () => {
    expect(escapeMarkdownV2('hello world')).toBe('hello world');
  });

  it('should escape a mix', () => {
    expect(escapeMarkdownV2('hello_world')).toBe('hello\\_world');
  });
});
