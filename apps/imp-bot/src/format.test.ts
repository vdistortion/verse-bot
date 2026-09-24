import { describe, expect, it } from 'vitest';
import { link } from 'tg-rich-messages';
import { formatFor } from './format.js';

describe('bot formatting', () => {
  it('preserves Telegram line breaks and HTML links', () => {
    const message = formatFor('telegram')`First\n${link('Example', 'https://example.com')}\nLast`;
    if (typeof message === 'string') throw new Error('Expected a Telegram rich message');

    const html = message.toHTML();
    expect(html).toContain('First\n');
    expect(html).toContain('<a href="https://example.com">Example</a>');
    expect(html).toContain('\nLast');
  });

  it('renders VK links and line breaks as plain text', () => {
    const message = formatFor('vk')`First\n${link('Example', 'https://example.com')}\nLast`;

    expect(message).toBe('First\n[https://example.com|Example]\nLast');
  });
});
