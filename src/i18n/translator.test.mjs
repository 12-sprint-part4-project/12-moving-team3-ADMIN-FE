import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveLanguage } from './config.ts';
import { getLanguageSnapshot, setStoredLanguage } from './languageStore.ts';
import { createTranslator } from './translator.ts';

test('지원 언어를 유지하고 잘못된 저장값은 한국어로 복원한다', () => {
  assert.equal(resolveLanguage('en'), 'en');
  assert.equal(resolveLanguage('zh-CN'), 'zh-CN');
  assert.equal(resolveLanguage('invalid'), 'ko');
  assert.equal(resolveLanguage(null), 'ko');
});

test('선택 언어의 번역을 반환한다', () => {
  assert.equal(createTranslator('ko')('common.language'), '언어');
  assert.equal(createTranslator('en')('common.language'), 'Language');
  assert.equal(createTranslator('zh-CN')('common.language'), '语言');
});

test('번역이 없으면 한국어 리소스와 번역 키 순서로 fallback한다', () => {
  const resources = {
    ko: { common: { greeting: '안녕하세요' } },
    en: { common: {} },
    'zh-CN': { common: {} },
  };
  const t = createTranslator('en', resources);

  assert.equal(t('common.greeting'), '안녕하세요');
  assert.equal(t('common.unknown'), 'common.unknown');
});

test('번역문의 매개변수를 치환한다', () => {
  const resources = {
    ko: { common: { welcome: '{name}님, 환영합니다.' } },
    en: { common: { welcome: 'Welcome, {name}.' } },
    'zh-CN': { common: { welcome: '欢迎，{name}。' } },
  };

  assert.equal(
    createTranslator('en', resources)('common.welcome', { name: 'Admin' }),
    'Welcome, Admin.'
  );
});

test('선택 언어를 localStorage에 저장하고 html lang에 반영한다', () => {
  const values = new Map();
  const originalWindow = globalThis.window;

  globalThis.window = {
    localStorage: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, value),
    },
    document: { documentElement: { lang: 'ko' } },
  };

  try {
    setStoredLanguage('zh-CN');

    assert.equal(getLanguageSnapshot(), 'zh-CN');
    assert.equal(globalThis.window.document.documentElement.lang, 'zh-CN');
  } finally {
    globalThis.window = originalWindow;
  }
});
