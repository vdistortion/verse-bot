import {
  getApiAdvice,
  getApiCat,
  getApiCountries,
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

export async function getWeather(apiKey: string, latitude: number, longitude: number) {
  const answer = await getApiWeather(apiKey, latitude, longitude);
  const getTempEmoji = (temp: number) => {
    if (temp <= -10) return '🥶';
    if (temp <= 0) return '❄️';
    if (temp <= 15) return '🌥️';
    if (temp <= 25) return '🌤️';
    return '🔥';
  };
  const tempIcon = getTempEmoji(answer.main.temp);
  const wind = answer.wind.speed > 0 ? `💨 _Ветер_: ${answer.wind.speed} м/с` : '🟦 _Штиль_';

  return `
🌍 *${answer.name}*

${tempIcon} _Температура_: ${answer.main.temp} ℃
🤔 _Ощущается как_: ${answer.main.feels_like} ℃
💧 _Влажность_: ${answer.main.humidity}%
📈 _Давление_: ${answer.main.pressure} мм рт. ст.
${wind}
`;
}

export { getApiCountries };

export async function getCountries(path: string) {
  function randomIndex(array: any[]): number {
    return Math.floor(Math.random() * array.length);
  }

  const apiCountries = await getApiCountries(path);
  type ICountry = (typeof apiCountries)[number];
  const list: [number, ICountry][] = [];
  const indexes: number[] = [];
  const count = 4;
  let correctAnswerIndex = -1;

  while (indexes.length < count) {
    const index = randomIndex(apiCountries);
    if (!indexes.includes(index)) indexes.push(index);
  }

  indexes.forEach((index) => {
    list.push([index, apiCountries[index]]);
  });

  correctAnswerIndex = randomIndex(list);
  return {
    list,
    correctAnswerIndex,
  };
}
