import { describe, it, expect } from 'vitest';
import { format, bold, link, spoiler, raw } from './index.js';

const fmtTG = format('telegram');
const fmtVK = format('vk');

describe('format', () => {
  it('should escape plain text for Telegram', () => {
    expect(fmtTG`hello_world`).toBe('hello\\_world');
  });

  it('should not escape for VK', () => {
    expect(fmtVK`hello_world`).toBe('hello_world');
  });

  it('should format bold for Telegram', () => {
    expect(fmtTG`${bold('text')}`).toBe('*text*');
  });

  it('should not apply markdown for VK bold', () => {
    expect(fmtVK`${bold('text')}`).toBe('text');
  });

  it('should format link for Telegram', () => {
    expect(fmtTG`${link('name', 'https://example.com')}`).toBe('[name](https://example.com)');
  });

  it('should format link for VK', () => {
    expect(fmtVK`${link('name', 'https://example.com')}`).toBe('name: https://example.com');
  });

  it('should handle nested tokens', () => {
    expect(fmtTG`${bold(link('click', 'http://x.com'))}`).toBe('*[click](http://x.com)*');
  });
});
