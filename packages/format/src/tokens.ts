import type { Platform } from '@verse-bot/core';
import { escapeMarkdownV2 } from './markdown.js';

export abstract class FormatToken {
  abstract render(platform: Platform): string;
}

export class BoldToken extends FormatToken {
  constructor(private text: string | FormatToken) {
    super();
  }
  render(platform: Platform): string {
    const inner =
      this.text instanceof FormatToken
        ? this.text.render(platform)
        : platform === 'telegram'
          ? escapeMarkdownV2(this.text)
          : this.text;
    if (platform === 'telegram') return `*${inner}*`;
    return inner;
  }
}

export class LinkToken extends FormatToken {
  constructor(
    private label: string | FormatToken,
    private url: string,
  ) {
    super();
  }
  render(platform: Platform): string {
    const labelStr =
      this.label instanceof FormatToken
        ? this.label.render(platform)
        : platform === 'telegram'
          ? escapeMarkdownV2(this.label)
          : this.label;
    if (platform === 'telegram') return `[${labelStr}](${this.url})`;
    return `${labelStr}: ${this.url}`;
  }
}

export class RawToken extends FormatToken {
  constructor(private content: string) {
    super();
  }
  render(): string {
    return this.content;
  }
}

export class SpoilerToken extends FormatToken {
  constructor(private text: string | FormatToken) {
    super();
  }
  render(platform: Platform): string {
    const inner =
      this.text instanceof FormatToken
        ? this.text.render(platform)
        : platform === 'telegram'
          ? escapeMarkdownV2(this.text)
          : this.text;
    if (platform === 'telegram') return `||${inner}||`;
    return inner;
  }
}

export class CodeToken extends FormatToken {
  constructor(private text: string) {
    super();
  }
  render(platform: Platform): string {
    if (platform === 'telegram') {
      return `\`${this.text.replace(/`/g, '\\`')}\``;
    }
    return this.text;
  }
}
