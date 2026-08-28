import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_LANGUAGE, resolveLanguage } from './config.ts';

for (const language of ['ko', 'en', 'zh-CN']) {
  test(`지원하는 언어 ${language}를 그대로 반환한다`, () => {
    assert.equal(resolveLanguage(language), language);
  });
}

for (const language of [null, '', 'zh', 'zh-TW', 'invalid']) {
  test(`지원하지 않는 언어 ${language}는 기본 언어로 대체한다`, () => {
    assert.equal(resolveLanguage(language), DEFAULT_LANGUAGE);
  });
}
