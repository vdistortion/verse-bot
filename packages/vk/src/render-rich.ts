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

export function renderRich(doc: RenderableMessage): string {
  let html = doc.toHTML();

  /**
   * Параграфы и переносы.
   */
  html = html
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n');

  /**
   * VK поддерживает ссылки в формате [URL|Текст].
   */
  html = html.replace(
    /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_match, href: string, inner: string) => {
      const text = stripTags(inner).trim();
      const url = decodeHtmlEntities(href);
      return text ? `[${url}|${text}]` : url;
    },
  );

  /**
   * Всё остальное форматирование VK игнорирует.
   */
  return stripTags(html).trim();
}
