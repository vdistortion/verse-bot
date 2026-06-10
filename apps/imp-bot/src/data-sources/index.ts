import { getApiAdvice, getApiCat } from './fetch.js';
import type { IApiAdviceData, IApiCatData } from './types.js';

export async function getCat(): Promise<string> {
  const { url } = await getApiCat<IApiCatData>();
  return url;
}

export async function getAdvice(): Promise<string> {
  const { text } = await getApiAdvice<IApiAdviceData>();
  return text;
}
