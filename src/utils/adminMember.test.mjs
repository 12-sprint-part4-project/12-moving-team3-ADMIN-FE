import assert from 'node:assert/strict';
import test from 'node:test';

import { formatAdminMemberPhoneNumber } from './adminMember.ts';

test('하이픈 없는 11자리 국내 휴대전화 번호를 표시 형식으로 변환한다', () => {
  assert.equal(formatAdminMemberPhoneNumber('01012345678'), '010-1234-5678');
});

test('하이픈이나 공백이 포함된 국내 휴대전화 번호를 동일한 형식으로 변환한다', () => {
  assert.equal(formatAdminMemberPhoneNumber('010-1234-5678'), '010-1234-5678');
  assert.equal(formatAdminMemberPhoneNumber('010 1234 5678'), '010-1234-5678');
});

test('전화번호가 없으면 대시를 반환한다', () => {
  assert.equal(formatAdminMemberPhoneNumber(null), '-');
  assert.equal(formatAdminMemberPhoneNumber(undefined), '-');
  assert.equal(formatAdminMemberPhoneNumber(''), '-');
});

test('예상하지 못한 길이나 형식의 값은 원본을 유지한다', () => {
  assert.equal(formatAdminMemberPhoneNumber('0101234567'), '0101234567');
  assert.equal(formatAdminMemberPhoneNumber('02-1234-5678'), '02-1234-5678');
  assert.equal(formatAdminMemberPhoneNumber('010.1234.5678'), '010.1234.5678');
});
