import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatAdminDashboardMoveDate,
  toAdminDashboardApiDate,
  toAdminDashboardStatisticsParams,
} from './adminDashboard.ts';

test('대시보드 API 날짜는 YYYY-MM-DD로 변환한다', () => {
  assert.equal(toAdminDashboardApiDate(new Date(2026, 7, 21)), '2026-08-21');
});

test('이사일은 locale에 맞는 날짜 형식으로 표시한다', () => {
  assert.equal(
    formatAdminDashboardMoveDate('2026-08-21', 'en'),
    new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(2026, 7, 21))
  );
});

test('기간이 없으면 통계 쿼리 파라미터를 생략한다', () => {
  assert.equal(toAdminDashboardStatisticsParams(), undefined);
  assert.equal(toAdminDashboardStatisticsParams(undefined), undefined);
  assert.equal(toAdminDashboardStatisticsParams({}), undefined);
});

test('시작일만 있으면 통계 쿼리에 startDate만 넣는다', () => {
  assert.deepEqual(
    toAdminDashboardStatisticsParams({ from: new Date(2026, 7, 1) }),
    { startDate: '2026-08-01' }
  );
});

test('시작일과 종료일이 있으면 통계 쿼리에 둘 다 넣는다', () => {
  assert.deepEqual(
    toAdminDashboardStatisticsParams({
      from: new Date(2026, 7, 1),
      to: new Date(2026, 7, 21),
    }),
    { startDate: '2026-08-01', endDate: '2026-08-21' }
  );
});
