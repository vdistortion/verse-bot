import { http } from '@verse-bot/shared';
import type { IApiAdviceData, IApiCatData, IApiQuoteData, IApiQuoteParams } from './types.js';

/**
 * Сайт: https://thecatapi.com/
 *
 * API: https://developers.thecatapi.com
 */
export async function getApiCat() {
  const [data] = await http<IApiCatData[]>('https://api.thecatapi.com/v1/images/search');
  return data;
}

/**
 * Сайт: https://forismatic.com
 *
 * API: https://forismatic.com/ru/api/
 */
export function getApiQuote() {
  return http<IApiQuoteData, IApiQuoteParams>('https://api.forismatic.com/api/1.0/', {
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
  return http<IApiAdviceData>('https://fucking-great-advice.ru/api/random');
}
