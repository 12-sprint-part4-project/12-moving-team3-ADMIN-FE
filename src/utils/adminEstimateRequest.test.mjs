import assert from 'node:assert/strict';
import test from 'node:test';

import { toAdminEstimateRequestDetailQuery } from './adminEstimateRequest.ts';

test('상세 앞뒤 query는 목록 필터를 유지하고 page/pageSize는 제외한다', () => {
  assert.deepEqual(
    toAdminEstimateRequestDetailQuery({
      page: 3,
      pageSize: 10,
      id: '26',
      userName: '홍길동',
      phoneNumber: '010-1234',
      status: 'SUBMITTED',
      startDate: '2026-07-01',
      endDate: '2026-07-30',
      sort: 'ASC',
    }),
    {
      id: '26',
      userName: '홍길동',
      phoneNumber: '010-1234',
      status: 'SUBMITTED',
      startDate: '2026-07-01',
      endDate: '2026-07-30',
      sort: 'ASC',
    }
  );
});

test('검색·필터가 없으면 정렬만 남기고 빈 값은 제외한다', () => {
  assert.deepEqual(
    toAdminEstimateRequestDetailQuery({
      page: 1,
      pageSize: 10,
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});

test('startDate가 없으면 endDate를 상세 query에 넣지 않는다', () => {
  assert.deepEqual(
    toAdminEstimateRequestDetailQuery({
      page: 1,
      pageSize: 10,
      endDate: '2026-07-30',
      sort: 'DESC',
    }),
    { sort: 'DESC' }
  );
});
