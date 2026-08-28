import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatAdminCompletedMissingFields,
  formatAdminCompletedMoveDate,
  formatAdminCompletedPrice,
  hasAdminCompletedMissingFields,
  toAdminCompletedApiDate,
  toAdminCompletedDetailQuery,
  toAdminCompletedStatisticsQuery,
} from './adminCompleted.ts';

const createTranslation = (resources) => (key, options) =>
  resources[key] ?? options?.defaultValue ?? key;

test('상세 앞뒤 query는 목록 필터를 유지하고 page/pageSize는 제외한다', () => {
  assert.deepEqual(
    toAdminCompletedDetailQuery({
      page: 3,
      pageSize: 10,
      id: '26',
      userName: '홍길동',
      phoneNumber: '010-1234',
      moveType: 'HOME',
      startDate: '2026-07-01',
      endDate: '2026-07-30',
      sort: 'ASC',
    }),
    {
      id: '26',
      userName: '홍길동',
      phoneNumber: '010-1234',
      moveType: 'HOME',
      startDate: '2026-07-01',
      endDate: '2026-07-30',
      sort: 'ASC',
    }
  );
});

test('검색·필터가 없으면 정렬만 남기고 빈 값은 제외한다', () => {
  assert.deepEqual(
    toAdminCompletedDetailQuery({
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});

test('startDate가 없으면 endDate를 상세 query에 넣지 않는다', () => {
  assert.deepEqual(
    toAdminCompletedDetailQuery({
      page: 1,
      pageSize: 10,
      endDate: '2026-07-30',
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});

test('완료 건 API 날짜는 YYYY-MM-DD로 변환한다', () => {
  assert.equal(toAdminCompletedApiDate(new Date(2026, 7, 21)), '2026-08-21');
});

test('이사일이 없으면 대시를 반환한다', () => {
  assert.equal(formatAdminCompletedMoveDate(null, 'ko'), '-');
});

test('이사일은 locale에 맞는 날짜 형식으로 표시한다', () => {
  assert.equal(
    formatAdminCompletedMoveDate('2026-08-21', 'en'),
    new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(2026, 7, 21))
  );
});

test('완료 건 금액이 없으면 대시를 반환하고 있으면 원화 형식으로 표시한다', () => {
  assert.equal(formatAdminCompletedPrice(null), '-');
  assert.equal(
    formatAdminCompletedPrice(250000),
    `${new Intl.NumberFormat('ko-KR').format(250000)}원`
  );
});

test('누락 필드가 있을 때만 안내를 보여 준다', () => {
  assert.equal(hasAdminCompletedMissingFields([]), false);
  assert.equal(hasAdminCompletedMissingFields(['mover']), true);
});

test('누락 필드는 한글 라벨로 바꾸고 알 수 없는 키는 원본을 유지한다', () => {
  assert.deepEqual(
    formatAdminCompletedMissingFields([
      'moveDate',
      'confirmedQuote.price',
      'unknownField',
    ]),
    ['이사일', '확정 견적 금액', 'unknownField']
  );
});

test('누락 필드 번역 키는 점(.)을 밑줄로 바꿔 조회한다', () => {
  const t = createTranslation({
    'completed.fields.confirmedQuote_moverName': 'Confirmed mover',
  });

  assert.deepEqual(
    formatAdminCompletedMissingFields(['confirmedQuote.moverName'], t),
    ['Confirmed mover']
  );
});

test('통계 쿼리는 시작일이 없으면 전체 기간으로 둔다', () => {
  assert.equal(toAdminCompletedStatisticsQuery(), undefined);
  assert.equal(
    toAdminCompletedStatisticsQuery(undefined, '2026-08-21'),
    undefined
  );
});

test('통계 쿼리는 시작일만 있으면 startDate만 넣고 종료일이 있으면 둘 다 넣는다', () => {
  assert.deepEqual(toAdminCompletedStatisticsQuery('2026-08-01'), {
    startDate: '2026-08-01',
  });
  assert.deepEqual(
    toAdminCompletedStatisticsQuery('2026-08-01', '2026-08-21'),
    { startDate: '2026-08-01', endDate: '2026-08-21' }
  );
});
