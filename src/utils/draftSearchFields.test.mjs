import assert from 'node:assert/strict';
import test from 'node:test';

import {
  clearDraftSearchValues,
  toOptionalTrimmedSearchPatch,
  trimDraftSearchValues,
} from './draftSearchFields.ts';

test('검색 초안은 trim하고 빈 문자열은 유지한다', () => {
  const drafts = { id: ' 12 ', userName: '  ', phoneNumber: '010' };

  assert.deepEqual(trimDraftSearchValues(drafts), {
    id: '12',
    userName: '',
    phoneNumber: '010',
  });
  assert.deepEqual(drafts, {
    id: ' 12 ',
    userName: '  ',
    phoneNumber: '010',
  });
});

test('검색 확정 값은 trim하고 빈 값은 쿼리에서 제외한다', () => {
  assert.deepEqual(
    toOptionalTrimmedSearchPatch({
      id: ' 12 ',
      userName: '  ',
      phoneNumber: '010-1234',
    }),
    {
      id: '12',
      userName: undefined,
      phoneNumber: '010-1234',
    }
  );
});

test('검색 초기화는 모든 초안을 빈 문자열로 만든다', () => {
  const drafts = { id: '12', userName: '홍길동' };

  assert.deepEqual(clearDraftSearchValues(drafts), {
    id: '',
    userName: '',
  });
  assert.deepEqual(drafts, { id: '12', userName: '홍길동' });
});
