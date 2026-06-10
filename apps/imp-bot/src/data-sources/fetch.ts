import { http } from '@verse-bot/core';

/**
 * Сайт: https://thecatapi.com/
 *
 * API: https://developers.thecatapi.com
 */
export async function getApiCat<T>() {
  const [data] = await http<T[]>('https://api.thecatapi.com/v1/images/search');
  return data;
}

/**
 * Сайт: https://fucking-great-advice.ru
 *
 * API: https://fucking-great-advice.ru/api
 */
export function getApiAdvice<T>() {
  return http<T>('https://fucking-great-advice.ru/api/random');
}
