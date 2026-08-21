import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatAdminReportContentMetadataValue,
  getMetadataLabel,
} from './adminReport.ts';

const createTranslation = (resources) => (key, options) =>
  resources[key] ?? options?.defaultValue ?? key;

test('신고 metadata 번역 키가 있으면 번역값을 사용한다', () => {
  const t = createTranslation({
    'reports.metadataValue.messageType.IMAGE': 'Image',
  });

  assert.equal(getMetadataLabel('messageType', 'IMAGE', t), 'Image');
});

test('신고 metadata 번역 키가 없으면 서버 원본 값을 표시한다', () => {
  const t = createTranslation({});

  assert.equal(getMetadataLabel('messageType', 'VIDEO', t), 'VIDEO');
});

test('번역 함수가 없으면 기존 한국어 label fallback을 유지한다', () => {
  assert.equal(getMetadataLabel('messageType', 'IMAGE'), '이미지');
});

test('신고 metadata 숫자를 한국어·영어·중국어 locale로 표시한다', () => {
  const value = 1234567.89;

  for (const locale of ['ko', 'en', 'zh-CN']) {
    assert.equal(
      formatAdminReportContentMetadataValue(
        'reportCount',
        value,
        undefined,
        locale
      ),
      new Intl.NumberFormat(locale).format(value)
    );
  }
});
