import { getApiAdvice, getApiCat, getApiQuote } from './fetch';

export async function getCat(): Promise<string> {
  const { url } = await getApiCat();
  return url;
}

export async function getQuote(): Promise<{ quoteText: string; quoteAuthor: string }> {
  const { quoteText, quoteAuthor } = await getApiQuote();
  return { quoteText, quoteAuthor };
}

export async function getAdvice(): Promise<string> {
  const { text } = await getApiAdvice();
  return text;
}

export async function getImage(): Promise<{ image: string; caption: string }> {
  return { image: 'placeholder.webp', caption: 'Заглушка изображения' };
}

export async function getList(): Promise<string> {
  return 'Заглушка текста';
}
