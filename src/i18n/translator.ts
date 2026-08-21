import { DEFAULT_LANGUAGE } from './config.ts';
import { TRANSLATION_RESOURCES } from './resources/index.ts';

import type { Language } from './config.ts';
import type {
  TranslationNamespaces,
  TranslationResources,
} from './resources/index.ts';

export type TranslationKey = `${string}.${string}`;
export type TranslationParams = Record<string, string | number>;

const interpolate = (message: string, params?: TranslationParams) => {
  if (!params) return message;

  return message.replace(/\{(\w+)\}/g, (placeholder, key: string) => {
    const value = params[key];
    return value === undefined ? placeholder : String(value);
  });
};

export const createTranslator = (
  language: Language,
  resources: TranslationResources = TRANSLATION_RESOURCES
) => {
  return (key: TranslationKey, params?: TranslationParams): string => {
    const separatorIndex = key.indexOf('.');
    const namespace = key.slice(0, separatorIndex);
    const messageKey = key.slice(separatorIndex + 1);
    const languageMessages = resources[language];
    const fallbackMessages = resources[DEFAULT_LANGUAGE];
    const message =
      languageMessages[namespace as keyof TranslationNamespaces]?.[
        messageKey
      ] ??
      fallbackMessages[namespace as keyof TranslationNamespaces]?.[
        messageKey
      ] ??
      key;

    return interpolate(message, params);
  };
};
