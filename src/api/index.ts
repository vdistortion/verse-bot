import {
  getApiAdvice,
  getApiCat,
  getApiImages,
  getApiList,
  getApiQuote,
  getApiWeather,
} from './fetch';

export async function getList() {
  const { text, number, length } = await getApiList();
  return `${text}\n\n*[${number}/${length}]*`;
}

export async function getImage() {
  const { path, text, number, length } = await getApiImages();
  return { image: path, caption: `${text}\n\n[${number}/${length}]` };
}

export async function getCat() {
  const { url } = await getApiCat();
  return url;
}

export async function getQuote() {
  const { quoteText, quoteAuthor } = await getApiQuote();
  return quoteAuthor ? `${quoteText}\n\n*${quoteAuthor}*` : quoteText;
}

export async function getAdvice() {
  const { text } = await getApiAdvice();
  return text;
}

export function getWeather(apiKey: string, latitude: number, longitude: number) {
  return getApiWeather(apiKey, latitude, longitude);
}
