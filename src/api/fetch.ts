import { list } from './list';
import { images } from './images';
import { http, pickRandom } from '../utils';
import type { IApiLocationData } from '../types';

export function getApiList() {
  interface IResultItem {
    text: string;
    number: number;
    length: number;
  }

  const randomIndex = pickRandom(list);
  const result: IResultItem = {
    text: list[randomIndex],
    number: randomIndex + 1,
    length: list.length,
  };

  return Promise.resolve(result);
}

export function getApiImages() {
  interface IResultImage {
    path: string;
    text: string;
    number: number;
    length: number;
  }

  const randomIndex = pickRandom(images);
  const name = images[randomIndex];
  const result: IResultImage = {
    path: name,
    text: name.split('.')[0],
    number: randomIndex + 1,
    length: images.length,
  };

  return Promise.resolve(result);
}

/**
 * Сайт: https://thecatapi.com/
 *
 * API: https://developers.thecatapi.com
 */
export async function getApiCat() {
  interface IApiData {
    id: string;
    url: string;
    width: number;
    height: number;
  }

  const [data] = await http<IApiData[]>('https://api.thecatapi.com/v1/images/search');
  return data;
}

/**
 * Сайт: https://forismatic.com
 *
 * API: https://forismatic.com/ru/api/
 */
export function getApiQuote() {
  interface IApiData {
    quoteText: string;
    quoteAuthor: string;
    quoteLink: string;
  }
  interface IApiParams {
    method: string;
    key: number;
    format: string;
    lang: string;
  }

  return http<IApiData, IApiParams>('https://api.forismatic.com/api/1.0/', {
    method: 'getQuote',
    key: 457653,
    format: 'json',
    lang: 'ru',
  });
}

/**
 * Сайт: https://fucking-great-advice.ru
 *
 * API: https://fucking-great-advice.ru/api
 */
export function getApiAdvice() {
  interface IApiData {
    id: number;
    text: string;
  }

  return http<IApiData>('https://fucking-great-advice.ru/api/random');
}

/**
 * Сайт: https://openweathermap.org
 *
 * API: https://openweathermap.org/current
 */
export async function getApiWeather(apiKey: string, latitude: number, longitude: number) {
  interface IApiParams {
    lat: number;
    lon: number;
    appid: string;
    mode?: 'xml' | 'html';
    units?: 'standard' | 'metric' | 'imperial';
    lang?: string;
  }

  return http<IApiLocationData, IApiParams>(`https://api.openweathermap.org/data/2.5/weather`, {
    lat: latitude,
    lon: longitude,
    appid: apiKey,
    units: 'metric',
    lang: 'ru',
  });
}

/**
 * Сайт: https://www.kody.su/
 *
 * API: https://www.kody.su/api
 */
export function getApiOperator(key: string, q: string) {
  interface IApiDataError {
    success: false;
    query: string;
    quota: number;
    error_code:
      | 'NUMBER_NOT_SET'
      | 'FORMAT_NOT_SET'
      | 'AUTH_REQUIRED'
      | 'AUTH_FAILED'
      | 'LIMIT_EXCEEDED'
      | 'NUMBER_TOO_SHORT'
      | 'NUMBER_TOO_LONG'
      | 'NUMBER_NOT_FOUND'
      | 'UNKNOWN_ERROR';
    error_message: string;
  }
  interface IApiDataSuccess {
    success: true;
    query: string;
    quota: number;
    numbers: [
      {
        number_current: string;
        success: boolean;
        number_type_str: 'ru_mobile' | 'ru_fixed' | 'ua_mobile' | 'other';
        number_type: number;
        def: string;
        number: string;
        code_start: string;
        code_end: string;
        operator: string;
        operator_full: string;
        region: string;
        time: string;
        bdpn: boolean;
        bdpn_operator: string;
      },
    ];
  }

  return http<IApiDataError | IApiDataSuccess, { q: string; key: string }>(
    'https://www.kody.su/api/v2.1/search.json',
    {
      q,
      key,
    },
  );
}
