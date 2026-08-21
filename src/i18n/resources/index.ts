import { SUPPORTED_LANGUAGES } from '../config.ts';
import { COMMON_MESSAGES } from './common.ts';

import type { Language } from '../config.ts';

export interface TranslationNamespaces {
  [namespace: string]: Record<string, string>;
  common: Record<string, string>;
}

export type TranslationResources = Record<Language, TranslationNamespaces>;

/** 기능별 리소스를 추가할 때 namespace를 이 객체에 합친다. */
export const TRANSLATION_RESOURCES = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((language) => [
    language,
    {
      common: COMMON_MESSAGES[language],
    },
  ])
) as TranslationResources;
