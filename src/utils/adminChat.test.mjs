import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildAdminChatListQuery,
  toAdminChatDetailQuery,
} from './adminChat.ts';
import { DEFAULT_ADMIN_LIST_PAGE_SIZE } from './adminListSearchParams.ts';

test('buildAdminChatListQuery는 userType과 필터를 API query로 구성한다', () => {
  assert.deepEqual(
    buildAdminChatListQuery({
      page: 2,
      pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
      id: '26',
      userName: '홍길동',
      roomType: 'GENERAL',
    }),
    {
      page: 2,
      pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
      id: '26',
      userName: '홍길동',
      roomType: 'GENERAL',
    }
  );
});

test('빈 검색 필드는 API query에서 제외한다', () => {
  assert.deepEqual(
    buildAdminChatListQuery({
      page: 1,
      pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
      id: '',
      userName: '',
    }),
    {
      page: 1,
      pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
    }
  );
});

test('roomType 필터를 유지한다', () => {
  assert.deepEqual(
    buildAdminChatListQuery({
      page: 1,
      pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
      roomType: 'COMMUNITY',
    }),
    {
      page: 1,
      pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
      roomType: 'COMMUNITY',
    }
  );
});

test('상세 앞뒤 query는 목록 필터를 유지하고 page/pageSize는 제외한다', () => {
  assert.deepEqual(
    toAdminChatDetailQuery({
      page: 2,
      pageSize: 10,
      id: '26',
      userName: '홍길동',
      roomType: 'GENERAL',
    }),
    {
      id: '26',
      userName: '홍길동',
      roomType: 'GENERAL',
    }
  );
});

test('검색·필터가 없으면 빈 객체를 반환한다', () => {
  assert.deepEqual(
    toAdminChatDetailQuery({
      page: 1,
      pageSize: 10,
    }),
    {}
  );
});
