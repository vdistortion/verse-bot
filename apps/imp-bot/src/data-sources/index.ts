import { getApiAdvice, getApiCat, getApiQuote } from './fetch.js';

export async function getCat(): Promise<string> {
  const { url } = await getApiCat();
  return url;
}

export async function getQuote(): Promise<{ quoteText: string; quoteAuthor: string }> {
  // try {
  //   const { quoteText, quoteAuthor } = await getApiQuote();
  //   return { quoteText, quoteAuthor };
  // } catch (err) {
  //   console.error('[getQuote] API error:', err);
  return {
    quoteText: 'Даже цитаты сегодня молчат. Попробуй позже.',
    quoteAuthor: '',
  };
  // }
}

export async function getAdvice(): Promise<string> {
  const { text } = await getApiAdvice();
  return text;
}
