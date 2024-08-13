import 'server-only';

const dictionaries = {
  ko: () => import('../dictionaries/ko').then((m) => m.dictionary),
  en: () => import('../dictionaries/en').then((m) => m.dictionary),
} as const;

export const getDictionary = async (locale: keyof typeof dictionaries) =>
  dictionaries[locale]();
