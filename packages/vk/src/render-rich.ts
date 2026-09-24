import type { RenderableMessage } from '@verse-bot/core';

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, ''));
}

export function renderVKRichHtml(input: string): string {
  let html = input;

  /**
   * Параграфы и переносы.
   */
  html = html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n');

  /**
   * External URLs remain visible and clickable as plain links. VK-native targets
   * use the [target|label] markup understood by VK clients.
   */
  html = html.replace(
    /<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href: string, inner: string) => {
      const text = stripTags(inner).trim();
      const url = decodeHtmlEntities(href);
      if (!text) return url;
      return /^https?:\/\//i.test(url) ? `${text}: ${url}` : `[${url}|${text}]`;
    },
  );

  /**
   * Всё остальное форматирование VK игнорирует.
   */
  return stripTags(html).trim();
}

export function renderRich(doc: RenderableMessage): string {
  return renderVKRichHtml(doc.toHTML());
}
