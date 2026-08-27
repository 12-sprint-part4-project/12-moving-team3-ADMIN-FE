import { describe, expect, it } from 'vitest';

import { ADMIN_REPORT_QUERY_KEYS } from '@/constants/adminReportQueryKeys';

describe('ADMIN_REPORT_QUERY_KEYS', () => {
  it('all key를 제공한다', () => {
    expect(ADMIN_REPORT_QUERY_KEYS.all).toEqual(['adminReports']);
  });

  it('lists() key를 제공한다', () => {
    expect(ADMIN_REPORT_QUERY_KEYS.lists()).toEqual(['adminReports', 'list']);
  });

  it('list(params) key를 제공한다', () => {
    const params = { page: 1, pageSize: 10, status: 'PENDING' as const };

    expect(ADMIN_REPORT_QUERY_KEYS.list(params)).toEqual([
      'adminReports',
      'list',
      params,
    ]);
  });

  it('statistics(params) key를 제공한다', () => {
    const params = { startDate: '2026-08-01', endDate: '2026-08-31' };

    expect(ADMIN_REPORT_QUERY_KEYS.statistics(params)).toEqual([
      'adminReports',
      'statistics',
      params,
    ]);
  });

  it('details() key를 제공한다', () => {
    expect(ADMIN_REPORT_QUERY_KEYS.details()).toEqual([
      'adminReports',
      'detail',
    ]);
  });

  it('detail(reportId, params) key를 제공한다', () => {
    const params = { status: 'PENDING' as const, sort: 'ASC' as const };

    expect(ADMIN_REPORT_QUERY_KEYS.detail(26, params)).toEqual([
      'adminReports',
      'detail',
      26,
      params,
    ]);
  });

  it('필터가 다른 목록 key를 분리한다', () => {
    const base = { page: 1, pageSize: 10 };
    const withFilter = { ...base, userName: '홍길동' };

    expect(ADMIN_REPORT_QUERY_KEYS.list(base)).not.toEqual(
      ADMIN_REPORT_QUERY_KEYS.list(withFilter)
    );
  });

  it('날짜가 다른 통계 key를 분리한다', () => {
    expect(
      ADMIN_REPORT_QUERY_KEYS.statistics({ startDate: '2026-08-01' })
    ).not.toEqual(
      ADMIN_REPORT_QUERY_KEYS.statistics({ startDate: '2026-09-01' })
    );
  });

  it('reportId가 다른 상세 key를 분리한다', () => {
    expect(ADMIN_REPORT_QUERY_KEYS.detail(26)).not.toEqual(
      ADMIN_REPORT_QUERY_KEYS.detail(27)
    );
  });

  it('같은 reportId라도 detail query가 다르면 key를 분리한다', () => {
    expect(
      ADMIN_REPORT_QUERY_KEYS.detail(26, { status: 'PENDING' })
    ).not.toEqual(ADMIN_REPORT_QUERY_KEYS.detail(26, { status: 'RESOLVED' }));
  });

  it('null reportId key를 생성한다', () => {
    expect(ADMIN_REPORT_QUERY_KEYS.detail(null)).toEqual([
      'adminReports',
      'detail',
      null,
      undefined,
    ]);
  });

  it('lists prefix가 하위 list key와 일치한다', () => {
    const listKey = ADMIN_REPORT_QUERY_KEYS.list({ page: 1 });
    const listsPrefix = ADMIN_REPORT_QUERY_KEYS.lists();

    expect(listKey.slice(0, listsPrefix.length)).toEqual(listsPrefix);
  });

  it('details prefix가 하위 detail key와 일치한다', () => {
    const detailKey = ADMIN_REPORT_QUERY_KEYS.detail(26);
    const detailsPrefix = ADMIN_REPORT_QUERY_KEYS.details();

    expect(detailKey.slice(0, detailsPrefix.length)).toEqual(detailsPrefix);
  });
});
