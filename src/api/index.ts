import {
  getApiAdvice,
  getApiCat,
  getApiCountries,
  getApiList,
  getApiQuote,
  getApiWeather,
} from './fetch';

export async function getList() {
  const { text, number, length } = await getApiList();
  return `${text}\n\n<b>[${number}/${length}]</b>`;
}

export async function getCat() {
  const { url } = await getApiCat();
  return url;
}

export async function getQuote() {
  const { quoteText, quoteAuthor } = await getApiQuote();
  return quoteAuthor ? `${quoteText}\n<b>${quoteAuthor}</b>` : quoteText;
}

export async function getAdvice() {
  const { text } = await getApiAdvice();
  return text;
}

export async function getWeather(apiKey: string, latitude: number, longitude: number) {
  const answer = await getApiWeather(apiKey, latitude, longitude);
  const wind = answer.wind.speed > 0 ? `<i>Ветер</i> ${answer.wind.speed} м/с` : 'Штиль';
  return `
<b>${answer.name}</b>
<i>Температура</i> ${answer.main.temp} ℃
<i>По ощущению</i> ${answer.main.feels_like} ℃
<i>Влажность</i> ${answer.main.humidity}%
<i>Давление</i> ${answer.main.pressure} мм рт. ст.
${wind}
  `;
}

export function getCountries(path: string) {
  return getApiCountries(path);
}
