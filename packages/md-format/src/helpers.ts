import { BoldToken, LinkToken, RawToken, SpoilerToken, FormatToken } from './tokens.js';

export const bold = (text: string | FormatToken) => new BoldToken(text);
export const link = (label: string | FormatToken, url: string) => new LinkToken(label, url);
export const raw = (content: string) => new RawToken(content);
export const spoiler = (text: string | FormatToken) => new SpoilerToken(text);
