import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  resolveLanguage,
} from './config.ts';

import type { Language } from './config.ts';

type Listener = () => void;

const listeners = new Set<Listener>();
let currentLanguage: Language = DEFAULT_LANGUAGE;

const readStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    currentLanguage = resolveLanguage(
      window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    );
  } catch {
    // 브라우저 정책으로 storage 접근이 막혀도 현재 세션의 언어는 유지한다.
  }

  return currentLanguage;
};

export const getLanguageSnapshot = () => readStoredLanguage();
export const getServerLanguageSnapshot = () => DEFAULT_LANGUAGE;

export const subscribeLanguage = (listener: Listener) => {
  listeners.add(listener);

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_STORAGE_KEY) listener();
  };

  window.addEventListener('storage', handleStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', handleStorage);
  };
};

export const setStoredLanguage = (language: Language) => {
  currentLanguage = language;

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // 저장 실패가 현재 화면의 언어 변경까지 막지 않게 한다.
  }

  window.document.documentElement.lang = language;
  listeners.forEach((listener) => listener());
};
