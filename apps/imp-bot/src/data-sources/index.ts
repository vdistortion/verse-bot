import { getApiAdvice, getApiCat, getApiFactByLegacy, getApiRandomFact } from './fetch.js';
import type { IApiAdviceData, IApiCatData, IApiFactData, IApiRandomFactData } from './types.js';

export async function getCat(): Promise<string> {
  const { url } = await getApiCat<IApiCatData>();
  return url;
}

export async function getAdvice(): Promise<string> {
  const { text } = await getApiAdvice<IApiAdviceData>();
  return text;
}

export async function getFact(): Promise<IApiFactData> {
  const randomFact = await getApiRandomFact<IApiRandomFactData>();
  return getApiFactByLegacy<IApiFactData>(randomFact.legacy_nid);
}
