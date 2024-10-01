import list from './list';

const weatherApiKey: string = process.env.API_KEY_OPENWEATHERMAP!;

export default {
  getList() {
    const randomIndex = Math.floor(Math.random() * list.length);
    const randomItem = list[randomIndex];
    const number = `<b>[${randomIndex + 1}/${list.length}]</b>`;
    const text = `${randomItem}\n\n${number}`;
    return Promise.resolve(text);
  },

  async getCat() {
    interface IApiData {
      url: string;
    }
    const response = await fetch('https://api.thecatapi.com/v1/images/search');
    const [data] = (await response.json()) as IApiData[];
    return data.url;
  },

  async getQuote() {
    interface IApiData {
      quoteText: string;
      quoteAuthor: string;
    }
    const response = await fetch(
      'https://api.forismatic.com/api/1.0/?method=getQuote&key=457653&format=json&lang=ru',
    );
    const { quoteText, quoteAuthor } = (await response.json()) as IApiData;
    return quoteAuthor ? `${quoteText}\n<b>${quoteAuthor}</b>` : quoteText;
  },

  async getAdvice() {
    interface IApiData {
      text: string;
    }
    const response = await fetch('https://fucking-great-advice.ru/api/random');
    const data = (await response.json()) as IApiData;
    return data.text;
  },

  async getWeather(latitude: number, longitude: number) {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric&lang=ru`,
    );
    return response.json();
  },
};
