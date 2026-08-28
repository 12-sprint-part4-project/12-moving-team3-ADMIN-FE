import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAdminMemberListHref,
  INITIAL_ADMIN_MEMBER_LIST_FILTERS,
  parseAdminMemberListSearchParams,
} from './adminMemberListSearchParams.ts';

test('회원 목록 query를 목록 상태로 복원한다', () => {
  assert.deepEqual(
    parseAdminMemberListSearchParams(
      new URLSearchParams(
        'userName=%20%ED%99%8D%EA%B8%B8%EB%8F%99%20&email=user%40test.com&phoneNumber=010-1234-5678&page=3&status=SUSPENDED&startDate=2026-08-01&endDate=2026-08-20&sort=ASC'
      )
    ),
    {
      userName: '홍길동',
      email: 'user@test.com',
      phoneNumber: '010-1234-5678',
      page: 3,
      pageSize: 10,
      status: 'SUSPENDED',
      startDate: '2026-08-01',
      endDate: '2026-08-20',
      sort: 'ASC',
    }
  );
});

test('잘못된 목록 query는 안전한 기본값으로 처리한다', () => {
  assert.deepEqual(
    parseAdminMemberListSearchParams(
      new URLSearchParams(
        'userName=%20&email=%20&phoneNumber=---&page=0&status=INVALID&startDate=2026-02-30&endDate=2026-01-01&sort=INVALID'
      )
    ),
    INITIAL_ADMIN_MEMBER_LIST_FILTERS
  );
});

test('기본값은 생략하고 memberId를 포함한 다른 query는 유지한다', () => {
  assert.equal(
    createAdminMemberListHref(
      '/members',
      new URLSearchParams(
        'memberId=550e8400-e29b-41d4-a716-446655440000&page=3&sort=ASC'
      ),
      INITIAL_ADMIN_MEMBER_LIST_FILTERS
    ),
    '/members?memberId=550e8400-e29b-41d4-a716-446655440000'
  );
});

test('목록 상태를 query에 반영하면서 다른 query를 보존한다', () => {
  assert.equal(
    createAdminMemberListHref(
      '/drivers',
      new URLSearchParams('memberId=mover-id&tab=profile'),
      {
        userName: '기사',
        page: 2,
        pageSize: 10,
        status: 'ACTIVE',
        startDate: '2026-08-01',
        endDate: '2026-08-20',
        sort: 'ASC',
      }
    ),
    '/drivers?memberId=mover-id&tab=profile&userName=%EA%B8%B0%EC%82%AC&page=2&status=ACTIVE&startDate=2026-08-01&endDate=2026-08-20&sort=ASC'
  );
});
