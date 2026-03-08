import zh from '@/data/zh.json';
import en from '@/data/en.json';

export type Language = 'zh' | 'en';
export type Translations = typeof zh;

const translations: Record<Language, Translations> = {
  zh,
  en,
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function t(lang: Language, path: string): string {
  const keys = path.split('.');
  let result: unknown = translations[lang];
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof result === 'string' ? result : path;
}
