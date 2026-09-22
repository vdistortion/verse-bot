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
});
