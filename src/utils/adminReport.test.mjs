import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatAdminReportContentMetadataValue,
  getMetadataLabel,
  toAdminReportDetailQuery,
  toAdminReportStatisticsQuery,
} from './adminReport.ts';

test('상세 앞뒤 query는 목록 필터를 유지하고 page/pageSize는 제외한다', () => {
  assert.deepEqual(
    toAdminReportDetailQuery({
      page: 2,
      pageSize: 10,
      id: '26',
      userName: '김민수',
      status: 'PENDING',
      target: 'REVIEW',
      reportedFrom: '2026-08-01',
      reportedTo: '2026-08-31',
      sort: 'ASC',
    }),
    {
      id: '26',
      userName: '김민수',
      status: 'PENDING',
      target: 'REVIEW',
      reportedFrom: '2026-08-01',
      reportedTo: '2026-08-31',
      sort: 'ASC',
    }
  );
});

test('검색·필터가 없으면 정렬만 남기고 빈 값은 제외한다', () => {
  assert.deepEqual(
    toAdminReportDetailQuery({
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});

test('toAdminReportStatisticsQuery는 reportedFrom이 없으면 undefined를 반환한다', () => {
  assert.equal(
    toAdminReportStatisticsQuery(undefined, '2026-08-31'),
    undefined
  );
});

test('toAdminReportStatisticsQuery는 reportedFrom만 있으면 startDate만 포함한다', () => {
  assert.deepEqual(toAdminReportStatisticsQuery('2026-08-01'), {
    startDate: '2026-08-01',
  });
});

test('toAdminReportStatisticsQuery는 reportedFrom과 reportedTo를 변환한다', () => {
  assert.deepEqual(toAdminReportStatisticsQuery('2026-08-01', '2026-08-31'), {
    startDate: '2026-08-01',
    endDate: '2026-08-31',
  });
});

test('toAdminReportDetailQuery는 reportedFrom 없이 reportedTo를 제외한다', () => {
  assert.deepEqual(
    toAdminReportDetailQuery({
      page: 1,
      pageSize: 10,
      reportedTo: '2026-08-31',
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});

test('REVIEW metadata rating을 포맷한다', () => {
  assert.equal(
    formatAdminReportContentMetadataValue('rating', 4, undefined, 'ko'),
    '★4'
  );
});

test('MESSAGE metadata messageType을 한글로 포맷한다', () => {
  assert.equal(
    formatAdminReportContentMetadataValue(
      'messageType',
      'IMAGE',
      undefined,
      'ko'
    ),
    '이미지'
  );
});

test('ARTICLE metadata category를 한글로 포맷한다', () => {
  assert.equal(
    formatAdminReportContentMetadataValue(
      'category',
      'QUESTION',
      undefined,
      'ko'
    ),
    '질문'
  );
});

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
