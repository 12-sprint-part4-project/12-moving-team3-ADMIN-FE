import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatLocalizedDate,
  formatLocalizedDateTime,
} from './formatLocalizedDate.ts';

const ISO_DATE = '2026-08-21T06:30:00.000Z';

test('날짜와 시간이 한국어·영어·중국어 locale에 따라 다르게 표시된다', () => {
  const values = ['ko', 'en', 'zh-CN'].map((locale) =>
    formatLocalizedDateTime(ISO_DATE, locale)
  );

  assert.equal(new Set(values).size, 3);
});

test('날짜가 한국어·영어·중국어 locale에 따라 다르게 표시된다', () => {
  const values = ['ko', 'en', 'zh-CN'].map((locale) =>
    formatLocalizedDate(ISO_DATE, locale)
  );

  assert.equal(new Set(values).size, 3);
});

test('잘못된 날짜 문자열은 원본을 반환한다', () => {
  assert.equal(formatLocalizedDate('invalid-date', 'ko'), 'invalid-date');
  assert.equal(formatLocalizedDateTime('invalid-date', 'en'), 'invalid-date');
});

test('날짜 전용 문자열은 시간대 변환 없이 같은 연월일을 유지한다', () => {
  const value = '2026-08-21';

  assert.equal(
    formatLocalizedDate(value, 'en'),
    new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(2026, 7, 21))
  );
});
