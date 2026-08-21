export const SUPPORTED_LANGUAGES = ['ko', 'en', 'zh-CN'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'ko';
export const LANGUAGE_STORAGE_KEY = 'admin-language';

export const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' &&
  SUPPORTED_LANGUAGES.some((language) => language === value);

export const resolveLanguage = (value: unknown): Language =>
  isLanguage(value) ? value : DEFAULT_LANGUAGE;
