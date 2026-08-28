import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAdminReviewListQuery,
  formatAdminReviewUserLabel,
  toAdminReviewDetailQuery,
  toAdminReviewStatisticsQuery,
} from './adminReview.ts';

test('상세 앞뒤 query는 목록 필터를 유지하고 page/pageSize는 제외한다', () => {
  assert.deepEqual(
    toAdminReviewDetailQuery({
      page: 2,
      pageSize: 10,
      id: '12',
      userName: '홍길동',
      moverName: '김기사',
      rating: 5,
      deletionStatus: 'ACTIVE',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      sort: 'ASC',
    }),
    {
      id: '12',
      userName: '홍길동',
      moverName: '김기사',
      rating: 5,
      deletionStatus: 'ACTIVE',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      sort: 'ASC',
    }
  );
});

test('검색·필터가 없으면 정렬만 남기고 빈 값은 제외한다', () => {
  assert.deepEqual(
    toAdminReviewDetailQuery({
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});

test('startDate가 없으면 endDate를 상세 query에 넣지 않는다', () => {
  assert.deepEqual(
    toAdminReviewDetailQuery({
      page: 1,
      pageSize: 10,
      endDate: '2026-08-31',
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});

test('startDate가 없으면 통계 query는 undefined다', () => {
  assert.equal(
    toAdminReviewStatisticsQuery(undefined, '2026-08-31'),
    undefined
  );
  assert.equal(toAdminReviewStatisticsQuery(), undefined);
});

test('시작일만 있으면 endDate 없이 통계 query를 만든다', () => {
  assert.deepEqual(toAdminReviewStatisticsQuery('2026-08-01'), {
    startDate: '2026-08-01',
  });
});

test('시작일과 종료일이 있으면 통계 query에 둘 다 포함한다', () => {
  assert.deepEqual(toAdminReviewStatisticsQuery('2026-08-01', '2026-08-31'), {
    startDate: '2026-08-01',
    endDate: '2026-08-31',
  });
});

test('목록 query는 빈 필드를 제외한다', () => {
  assert.deepEqual(
    buildAdminReviewListQuery({
      sort: 'DESC',
      page: 1,
      pageSize: 10,
    }),
    {
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    }
  );
});

test('목록 query는 rating 1~5를 유지한다', () => {
  assert.deepEqual(
    buildAdminReviewListQuery({
      sort: 'DESC',
      page: 1,
      pageSize: 10,
      rating: 3,
    }),
    {
      page: 1,
      pageSize: 10,
      sort: 'DESC',
      rating: 3,
    }
  );
});

test('목록 query는 deletionStatus를 유지한다', () => {
  assert.deepEqual(
    buildAdminReviewListQuery({
      sort: 'DESC',
      page: 1,
      pageSize: 10,
      deletionStatus: 'DELETED',
    }),
    {
      page: 1,
      pageSize: 10,
      sort: 'DESC',
      deletionStatus: 'DELETED',
    }
  );
});

test('startDate 없이 endDate만 있으면 목록 query에 endDate를 넣지 않는다', () => {
  assert.deepEqual(
    buildAdminReviewListQuery({
      sort: 'DESC',
      page: 1,
      pageSize: 10,
      endDate: '2026-08-31',
    }),
    {
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    }
  );
});

test('이름과 닉네임이 다르면 괄호로 닉네임을 표시한다', () => {
  assert.equal(
    formatAdminReviewUserLabel({ name: '홍길동', nickname: '길동' }),
    '홍길동 (길동)'
  );
});

test('이름과 닉네임이 같으면 이름만 표시한다', () => {
  assert.equal(
    formatAdminReviewUserLabel({ name: '홍길동', nickname: '홍길동' }),
    '홍길동'
  );
});

test('닉네임이 없으면 이름만 표시한다', () => {
  assert.equal(
    formatAdminReviewUserLabel({ name: '홍길동', nickname: '' }),
    '홍길동'
  );
});
