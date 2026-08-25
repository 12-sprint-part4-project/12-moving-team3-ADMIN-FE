import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatAdminMemberPhoneNumber,
  getAdminMemberRowNumber,
  toAdminMemberDetailQuery,
} from './adminMember.ts';

test('상세 앞뒤 query는 목록 필터를 유지하고 page/pageSize는 제외한다', () => {
  assert.deepEqual(
    toAdminMemberDetailQuery({
      userType: 'CUSTOMER',
      page: 2,
      pageSize: 10,
      userName: '홍길동',
      email: 'user@example.com',
      status: 'ACTIVE',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      sort: 'ASC',
    }),
    {
      userType: 'CUSTOMER',
      userName: '홍길동',
      email: 'user@example.com',
      status: 'ACTIVE',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      sort: 'ASC',
    }
  );
});

test('전체 개수를 기준으로 페이지의 행 번호를 역순 계산한다', () => {
  assert.equal(getAdminMemberRowNumber(25, 1, 10, 0), 25);
  assert.equal(getAdminMemberRowNumber(25, 2, 10, 0), 15);
  assert.equal(getAdminMemberRowNumber(25, 3, 10, 4), 1);
});

test('필터링된 전체 개수를 기준으로 행 번호를 계산한다', () => {
  assert.equal(getAdminMemberRowNumber(3, 1, 10, 0), 3);
  assert.equal(getAdminMemberRowNumber(3, 1, 10, 2), 1);
});

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

test('공백이나 하이픈만 있는 전화번호는 대시를 반환한다', () => {
  assert.equal(formatAdminMemberPhoneNumber('   '), '-');
  assert.equal(formatAdminMemberPhoneNumber('---'), '-');
  assert.equal(formatAdminMemberPhoneNumber(' - '), '-');
});

test('예상하지 못한 길이나 형식의 값은 원본을 유지한다', () => {
  assert.equal(formatAdminMemberPhoneNumber('0101234567'), '0101234567');
  assert.equal(formatAdminMemberPhoneNumber('02-1234-5678'), '02-1234-5678');
  assert.equal(formatAdminMemberPhoneNumber('010.1234.5678'), '010.1234.5678');
});
