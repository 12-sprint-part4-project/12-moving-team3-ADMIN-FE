import { describe, expect, it } from 'vitest';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';

describe('ADMIN_REVIEW_QUERY_KEYS', () => {
  it('all key를 제공한다', () => {
    expect(ADMIN_REVIEW_QUERY_KEYS.all).toEqual(['adminReviews']);
  });

  it('lists() key를 제공한다', () => {
    expect(ADMIN_REVIEW_QUERY_KEYS.lists()).toEqual(['adminReviews', 'list']);
  });

  it('list(params) key를 제공한다', () => {
    const params = { page: 1, pageSize: 10, rating: 5 };

    expect(ADMIN_REVIEW_QUERY_KEYS.list(params)).toEqual([
      'adminReviews',
      'list',
      params,
    ]);
  });

  it('statisticses() key를 제공한다', () => {
    expect(ADMIN_REVIEW_QUERY_KEYS.statisticses()).toEqual([
      'adminReviews',
      'statistics',
    ]);
  });

  it('statistics(params) key를 제공한다', () => {
    const params = { startDate: '2026-08-01', endDate: '2026-08-31' };

    expect(ADMIN_REVIEW_QUERY_KEYS.statistics(params)).toEqual([
      'adminReviews',
      'statistics',
      params,
    ]);
  });

  it('details() key를 제공한다', () => {
    expect(ADMIN_REVIEW_QUERY_KEYS.details()).toEqual([
      'adminReviews',
      'detail',
    ]);
  });

  it('detail(reviewId, params) key를 제공한다', () => {
    const params = { userName: '홍길동', sort: 'ASC' as const };

    expect(ADMIN_REVIEW_QUERY_KEYS.detail(10, params)).toEqual([
      'adminReviews',
      'detail',
      10,
      params,
    ]);
  });

  it('필터가 다른 목록 key를 분리한다', () => {
    const base = { page: 1, pageSize: 10 };
    const withFilter = { ...base, userName: '홍길동' };

    expect(ADMIN_REVIEW_QUERY_KEYS.list(base)).not.toEqual(
      ADMIN_REVIEW_QUERY_KEYS.list(withFilter)
    );
  });

  it('날짜가 다른 통계 key를 분리한다', () => {
    expect(
      ADMIN_REVIEW_QUERY_KEYS.statistics({ startDate: '2026-08-01' })
    ).not.toEqual(
      ADMIN_REVIEW_QUERY_KEYS.statistics({ startDate: '2026-09-01' })
    );
  });

  it('reviewId가 다른 상세 key를 분리한다', () => {
    expect(ADMIN_REVIEW_QUERY_KEYS.detail(10)).not.toEqual(
      ADMIN_REVIEW_QUERY_KEYS.detail(11)
    );
  });

  it('같은 reviewId라도 detail query가 다르면 key를 분리한다', () => {
    expect(ADMIN_REVIEW_QUERY_KEYS.detail(10, { rating: 5 })).not.toEqual(
      ADMIN_REVIEW_QUERY_KEYS.detail(10, { rating: 4 })
    );
  });

  it('null reviewId key를 생성한다', () => {
    expect(ADMIN_REVIEW_QUERY_KEYS.detail(null)).toEqual([
      'adminReviews',
      'detail',
      null,
      undefined,
    ]);
  });

  it('lists prefix가 하위 list key와 일치한다', () => {
    const listKey = ADMIN_REVIEW_QUERY_KEYS.list({ page: 1 });
    const listsPrefix = ADMIN_REVIEW_QUERY_KEYS.lists();

    expect(listKey.slice(0, listsPrefix.length)).toEqual(listsPrefix);
  });

  it('statisticses prefix가 하위 statistics key와 일치한다', () => {
    const statisticsKey = ADMIN_REVIEW_QUERY_KEYS.statistics({
      startDate: '2026-08-01',
    });
    const statisticsesPrefix = ADMIN_REVIEW_QUERY_KEYS.statisticses();

    expect(statisticsKey.slice(0, statisticsesPrefix.length)).toEqual(
      statisticsesPrefix
    );
  });

  it('details prefix가 하위 detail key와 일치한다', () => {
    const detailKey = ADMIN_REVIEW_QUERY_KEYS.detail(10);
    const detailsPrefix = ADMIN_REVIEW_QUERY_KEYS.details();

    expect(detailKey.slice(0, detailsPrefix.length)).toEqual(detailsPrefix);
  });
});
