import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createDetailHref,
  parseNumericDetailId,
} from './detailSearchParams.ts';

test('기존 query를 유지하면서 지정한 상세 ID를 추가하거나 변경한다', () => {
  assert.equal(
    createDetailHref(
      '/members',
      new URLSearchParams('page=3&status=ACTIVE'),
      'memberId',
      'member-b'
    ),
    '/members?page=3&status=ACTIVE&memberId=member-b'
  );
  assert.equal(
    createDetailHref(
      '/reports',
      new URLSearchParams('page=3&reportId=1'),
      'reportId',
      '2'
    ),
    '/reports?page=3&reportId=2'
  );
});

test('지정한 상세 ID만 제거하고 나머지 query는 유지한다', () => {
  assert.equal(
    createDetailHref(
      '/members',
      new URLSearchParams('page=3&memberId=member-a&sortOrder=DESC'),
      'memberId',
      null
    ),
    '/members?page=3&sortOrder=DESC'
  );
  assert.equal(
    createDetailHref('/chats', new URLSearchParams('roomId=1'), 'roomId', null),
    '/chats'
  );
});

test('양의 안전한 정수만 숫자 상세 ID로 변환한다', () => {
  assert.equal(parseNumericDetailId('15'), 15);
  assert.equal(parseNumericDetailId(null), null);
  assert.equal(parseNumericDetailId(''), null);
  assert.equal(parseNumericDetailId('0'), null);
  assert.equal(parseNumericDetailId('-1'), null);
  assert.equal(parseNumericDetailId('1.5'), null);
  assert.equal(parseNumericDetailId('invalid'), null);
  assert.equal(parseNumericDetailId('9007199254740992'), null);
});
