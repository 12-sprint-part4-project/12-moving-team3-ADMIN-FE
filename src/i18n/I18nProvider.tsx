'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  getLanguageSnapshot,
  getServerLanguageSnapshot,
  setStoredLanguage,
  subscribeLanguage,
} from './languageStore';
import { TRANSLATION_RESOURCES } from './resources/index';
import { createTranslator } from './translator';

import type { Language } from './config';
import type { TranslationKey, TranslationParams } from './translator';

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  children: ReactNode;
}

const LOCALIZABLE_ATTRIBUTES = [
  'aria-label',
  'placeholder',
  'title',
  'alt',
] as const;
const API_DATA_SELECTOR = 'td, dd, [data-i18n-ignore]';

const UI_MESSAGE_KEY_BY_VALUE = new Map<string, TranslationKey>();

Object.values(TRANSLATION_RESOURCES).forEach(({ ui }) => {
  Object.entries(ui).forEach(([messageKey, value]) => {
    UI_MESSAGE_KEY_BY_VALUE.set(value, `ui.${messageKey}`);
  });
});

const localizeText = (
  value: string,
  t: I18nContextValue['t']
): string | null => {
  const trimmedValue = value.trim();
  const key = UI_MESSAGE_KEY_BY_VALUE.get(trimmedValue);

  if (!key) {
    return null;
  }

  return value.replace(trimmedValue, t(key));
};

const localizeElement = (element: Element, t: I18nContextValue['t']) => {
  if (element.closest(API_DATA_SELECTOR)) {
    return;
  }

  LOCALIZABLE_ATTRIBUTES.forEach((attribute) => {
    const value = element.getAttribute(attribute);

    if (!value) {
      return;
    }

    const localizedValue = localizeText(value, t);

    if (localizedValue !== null && localizedValue !== value) {
      element.setAttribute(attribute, localizedValue);
    }
  });
};

const localizeUiTree = (root: Node, t: I18nContextValue['t']) => {
  if (root instanceof Text) {
    if (root.parentElement?.closest(API_DATA_SELECTOR)) {
      return;
    }

    const localizedValue = localizeText(root.data, t);

    if (localizedValue !== null && localizedValue !== root.data) {
      root.data = localizedValue;
    }

    return;
  }

  if (!(root instanceof Element) || root.matches('script, style')) {
    return;
  }

  localizeElement(root, t);

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;

    if (node instanceof Element) {
      localizeElement(node, t);
      continue;
    }

    if (node instanceof Text) {
      if (node.parentElement?.closest(API_DATA_SELECTOR)) {
        continue;
      }

      const localizedValue = localizeText(node.data, t);

      if (localizedValue !== null && localizedValue !== node.data) {
        node.data = localizedValue;
      }
    }
  }
};

export const I18nProvider = ({ children }: I18nProviderProps) => {
  const language = useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    getServerLanguageSnapshot
  );

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = createTranslator(language)('ui.adminTitle');

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        createTranslator(language)('ui.adminDescription')
      );
  }, [language]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setStoredLanguage(nextLanguage);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: createTranslator(language),
    }),
    [language, setLanguage]
  );

  useEffect(() => {
    const root = document.body;
    localizeUiTree(root, value.t);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') {
          localizeElement(mutation.target as Element, value.t);
          return;
        }

        mutation.addedNodes.forEach((node) => localizeUiTree(node, value.t));

        if (mutation.type === 'characterData') {
          localizeUiTree(mutation.target, value.t);
        }
      });
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: [...LOCALIZABLE_ATTRIBUTES],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
};
