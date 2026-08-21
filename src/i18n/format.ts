import { getLanguageSnapshot } from './languageStore.ts';
import { TRANSLATION_RESOURCES } from './resources/index.ts';
import { createTranslator } from './translator.ts';

import type { TranslationKey, TranslationParams } from './translator.ts';

const getValidDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatLocalizedDateTime = (value: string) => {
  const date = getValidDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat(getLanguageSnapshot(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatLocalizedDate = (value: string) => {
  const date = getValidDate(value);

  if (!date) {
    return value;
  }

  return new Intl.DateTimeFormat(getLanguageSnapshot(), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
};

export const formatLocalizedNumber = (value: number) =>
  new Intl.NumberFormat(getLanguageSnapshot()).format(value);

export const formatLocalizedKrw = (value: number) =>
  new Intl.NumberFormat(getLanguageSnapshot(), {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0,
  }).format(value);

export const translateCurrent = (
  key: TranslationKey,
  params?: TranslationParams
) => createTranslator(getLanguageSnapshot())(key, params);

const CURRENT_UI_KEY_BY_KOREAN_VALUE = new Map(
  Object.entries(TRANSLATION_RESOURCES.ko.ui).map(([key, value]) => [
    value,
    `ui.${key}` as TranslationKey,
  ])
);

export const translateCurrentUiValue = (value: string) => {
  const key = CURRENT_UI_KEY_BY_KOREAN_VALUE.get(value);
  return key ? translateCurrent(key) : value;
};
