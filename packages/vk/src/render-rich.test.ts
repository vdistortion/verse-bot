import { describe, expect, it } from 'vitest';
import { renderRich } from './render-rich.js';

describe('renderRich', () => {
  it('renders links using VK link markup', () => {
    expect(
      renderRich({
        toHTML: () => '<p><a href="https://example.com">Example</a></p>',
      }),
    ).toBe('[https://example.com|Example]');
  });

  it('preserves paragraphs, line breaks, and decoded entities', () => {
    expect(
      renderRich({
        toHTML: () => '<p>Hello &amp; welcome<br>to <strong>Verse</strong></p><p>Next</p>',
      }),
    ).toBe('Hello & welcome\nto Verse\n\nNext');
  });

  it('uses the URL when a link has no visible text', () => {
    expect(
      renderRich({
        toHTML: () => '<p><a href="https://example.com?a=1&amp;b=2"></a></p>',
      }),
    ).toBe('https://example.com?a=1&b=2');
  });
});
