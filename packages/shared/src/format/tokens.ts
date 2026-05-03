import type { Platform } from '../universal-context';

// Базовый класс токена
export abstract class FormatToken {
  abstract render(platform: Platform): string;
}

export class BoldToken extends FormatToken {
  constructor(private text: string | FormatToken) {
    super();
  }
  render(platform: Platform): string {
    const inner = this.text instanceof FormatToken ? this.text.render(platform) : String(this.text);
    return platform === 'telegram' ? `*${inner}*` : inner;
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
      this.label instanceof FormatToken ? this.label.render(platform) : String(this.label);
    if (platform === 'telegram') {
      // url считаем валидным
      return `[${labelStr}](${this.url})`;
    } else {
      return `${labelStr}: ${this.url}`;
    }
  }
}

export class RawToken extends FormatToken {
  constructor(private content: string) {
    super();
  }
  render(platform: Platform): string {
    return this.content;
  }
}

export class SpoilerToken extends FormatToken {
  constructor(private text: string | FormatToken) {
    super();
  }
  render(platform: Platform): string {
    const inner = this.text instanceof FormatToken ? this.text.render(platform) : String(this.text);
    return platform === 'telegram' ? `||${inner}||` : inner;
  }
}
