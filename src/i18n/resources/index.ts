import { SUPPORTED_LANGUAGES } from '../config.ts';
import { AUTH_MESSAGES } from './auth.ts';
import { COMMON_MESSAGES } from './common.ts';
import { HEADER_MESSAGES } from './header.ts';
import { SIDEBAR_MESSAGES } from './sidebar.ts';

import type { Language } from '../config.ts';

export interface TranslationNamespaces {
  [namespace: string]: Record<string, string>;
  common: Record<string, string>;
  auth: Record<string, string>;
  header: Record<string, string>;
  sidebar: Record<string, string>;
}

export type TranslationResources = Record<Language, TranslationNamespaces>;

/** 기능별 리소스를 추가할 때 namespace를 이 객체에 합친다. */
export const TRANSLATION_RESOURCES = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((language) => [
    language,
    {
      common: COMMON_MESSAGES[language],
      auth: AUTH_MESSAGES[language],
      header: HEADER_MESSAGES[language],
      sidebar: SIDEBAR_MESSAGES[language],
    },
  ])
) as TranslationResources;
