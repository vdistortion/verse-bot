const markdownV2SpecialCharacters = [
  '_',
  '*',
  '[',
  ']',
  '(',
  ')',
  '~',
  '`',
  '>',
  '#',
  '+',
  '-',
  '=',
  '|',
  '{',
  '}',
  '.',
  '!',
];

export function escapeMarkdownV2(text: string): string {
  // Сначала экранируем сам символ обратной косой черты,
  // чтобы избежать проблем с двойным экранированием других символов.
  let escapedText = text.replace(/\\/g, '\\\\');

  // Затем экранируем остальные специальные символы MarkdownV2
  for (const char of markdownV2SpecialCharacters) {
    // Создаем регулярное выражение для текущего спецсимвола.
    // Важно экранировать сам символ в регулярном выражении, если он является спецсимволом regex.
    const regexChar = char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(regexChar, 'g');
    escapedText = escapedText.replace(regex, `\\${char}`);
  }
  return escapedText;
}
