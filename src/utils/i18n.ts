import { ru, type LangType } from '../locales/ru';

export type LanguageCode = 'ru';

const languages: Record<LanguageCode, LangType> = {
  ru,
};

export function getPhrase<T extends keyof LangType>(
  key: T,
  lang: LanguageCode = 'ru',
): LangType[T] {
  return languages[lang][key];
}
