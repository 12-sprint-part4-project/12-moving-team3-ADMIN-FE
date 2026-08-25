import assert from 'node:assert/strict';
import test from 'node:test';

import { toAdminChatDetailQuery } from './adminChat.ts';

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
