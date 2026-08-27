import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getEstimateRequestSearchFieldErrors,
  getPhoneNumberSearchFieldErrors,
  getSearchIdFieldErrors,
  hasEstimateRequestSearchFieldErrors,
  hasSearchIdFieldErrors,
  isValidSearchId,
  isValidSearchPhoneNumber,
} from './adminSearchFieldValidation.ts';

test('검색 id는 1 이상의 정수만 허용한다', () => {
  assert.equal(isValidSearchId('1'), true);
  assert.equal(isValidSearchId('42'), true);
  assert.equal(isValidSearchId(' 12 '), true);
  assert.equal(isValidSearchId('0'), false);
  assert.equal(isValidSearchId('000'), false);
  assert.equal(isValidSearchId('abc'), false);
  assert.equal(isValidSearchId(''), false);
});

test('전화번호 검색은 숫자가 하나 이상이면 구분자를 허용한다', () => {
  assert.equal(isValidSearchPhoneNumber('010-1234-5678'), true);
  assert.equal(isValidSearchPhoneNumber('010'), true);
  assert.equal(isValidSearchPhoneNumber(' 010 '), true);
  assert.equal(isValidSearchPhoneNumber('---'), false);
  assert.equal(isValidSearchPhoneNumber(''), false);
});

test('검색 초안의 빈 값은 오류로 보지 않는다', () => {
  assert.deepEqual(
    getEstimateRequestSearchFieldErrors({ id: '', phoneNumber: '' }),
    {}
  );
  assert.deepEqual(
    getEstimateRequestSearchFieldErrors({ id: '  ', phoneNumber: '   ' }),
    {}
  );
});

test('검색 초안의 잘못된 id와 전화번호를 필드별 오류로 표시한다', () => {
  assert.deepEqual(
    getEstimateRequestSearchFieldErrors({
      id: '0',
      phoneNumber: '010-1234',
    }),
    { id: true }
  );
  assert.deepEqual(
    getEstimateRequestSearchFieldErrors({
      id: '12',
      phoneNumber: '---',
    }),
    { phoneNumber: true }
  );
  assert.deepEqual(
    getEstimateRequestSearchFieldErrors({ id: 'abc', phoneNumber: '---' }),
    { id: true, phoneNumber: true }
  );
});

test('검색 초안 오류 플래그가 하나라도 있으면 제출을 막는다', () => {
  assert.equal(hasEstimateRequestSearchFieldErrors({}), false);
  assert.equal(hasEstimateRequestSearchFieldErrors({ id: true }), true);
  assert.equal(
    hasEstimateRequestSearchFieldErrors({ phoneNumber: true }),
    true
  );
});

test('id만 검증할 때는 잘못된 번호만 오류로 표시한다', () => {
  assert.deepEqual(getSearchIdFieldErrors(''), {});
  assert.deepEqual(getSearchIdFieldErrors('26'), {});
  assert.deepEqual(getSearchIdFieldErrors('0'), { id: true });
  assert.equal(hasSearchIdFieldErrors({}), false);
  assert.equal(hasSearchIdFieldErrors({ id: true }), true);
  assert.equal(hasSearchIdFieldErrors({ phoneNumber: true }), false);
});

test('전화번호만 검증할 때는 숫자가 없는 값만 오류로 표시한다', () => {
  assert.deepEqual(getPhoneNumberSearchFieldErrors(''), {});
  assert.deepEqual(getPhoneNumberSearchFieldErrors('010-1234'), {});
  assert.deepEqual(getPhoneNumberSearchFieldErrors('---'), {
    phoneNumber: true,
  });
});
