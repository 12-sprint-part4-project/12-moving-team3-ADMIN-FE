import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatAdminEstimateQuotePrice,
  formatAdminEstimateQuoteStatus,
  formatAdminEstimateRequestMissingFields,
  formatAdminEstimateRequestMoveType,
  formatAdminEstimateRequestNullableText,
  formatAdminEstimateRequestPhoneNumber,
  formatAdminEstimateRequestSubmittedAt,
  getAdminEstimateRequestNameWithNickname,
  hasAdminEstimateRequestMissingFields,
  toAdminEstimateRequestApiDate,
  toAdminEstimateRequestDetailQuery,
  toAdminEstimateRequestStatisticsQuery,
} from './adminEstimateRequest.ts';

const createTranslation = (resources) => (key, options) =>
  resources[key] ?? options?.defaultValue ?? key;

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

test('견적 요청 API 날짜는 YYYY-MM-DD로 변환한다', () => {
  assert.equal(
    toAdminEstimateRequestApiDate(new Date(2026, 6, 1)),
    '2026-07-01'
  );
});

test('값이 없으면 텍스트를 대시로 표시한다', () => {
  assert.equal(formatAdminEstimateRequestNullableText(null), '-');
  assert.equal(formatAdminEstimateRequestNullableText(undefined), '-');
  assert.equal(formatAdminEstimateRequestNullableText(''), '-');
  assert.equal(formatAdminEstimateRequestNullableText('   '), '-');
  assert.equal(formatAdminEstimateRequestNullableText('홍길동'), '홍길동');
});

test('이름과 다른 닉네임이 있으면 둘 다 반환한다', () => {
  assert.deepEqual(getAdminEstimateRequestNameWithNickname('홍길동', '길동'), {
    name: '홍길동',
    nickname: '길동',
  });
});

test('닉네임이 없거나 이름과 같으면 이름만 반환한다', () => {
  assert.deepEqual(getAdminEstimateRequestNameWithNickname('홍길동', null), {
    name: '홍길동',
    nickname: null,
  });
  assert.deepEqual(
    getAdminEstimateRequestNameWithNickname('홍길동', '홍길동'),
    { name: '홍길동', nickname: null }
  );
});

test('이름이 없으면 닉네임을 본문으로 사용한다', () => {
  assert.deepEqual(getAdminEstimateRequestNameWithNickname(null, '길동'), {
    name: '길동',
    nickname: null,
  });
  assert.deepEqual(getAdminEstimateRequestNameWithNickname('', ''), {
    name: '-',
    nickname: null,
  });
});

test('제출일이 없으면 대시를 반환한다', () => {
  assert.equal(formatAdminEstimateRequestSubmittedAt(null, 'ko'), '-');
});

test('제출일은 locale에 맞는 날짜·시간 형식으로 표시한다', () => {
  const value = '2026-08-21T06:30:00.000Z';
  const locales = ['ko', 'en', 'zh-CN'].map((locale) =>
    formatAdminEstimateRequestSubmittedAt(value, locale)
  );

  assert.equal(new Set(locales).size, 3);
  assert.notEqual(locales[0], '-');
});

test('010으로 시작하는 11자리 휴대전화 번호를 표시 형식으로 변환한다', () => {
  assert.equal(
    formatAdminEstimateRequestPhoneNumber('01012345678'),
    '010-1234-5678'
  );
  assert.equal(
    formatAdminEstimateRequestPhoneNumber('010-1234-5678'),
    '010-1234-5678'
  );
});

test('전화번호가 없으면 대시를 반환하고 다른 형식은 원본을 유지한다', () => {
  assert.equal(formatAdminEstimateRequestPhoneNumber(null), '-');
  assert.equal(formatAdminEstimateRequestPhoneNumber(''), '-');
  assert.equal(
    formatAdminEstimateRequestPhoneNumber('02-1234-5678'),
    '02-1234-5678'
  );
});

test('이사 유형이 없으면 대시를 반환하고 있으면 한글 라벨을 사용한다', () => {
  assert.equal(formatAdminEstimateRequestMoveType(null), '-');
  assert.equal(formatAdminEstimateRequestMoveType('HOME'), '가정이사');
});

test('이사 유형 번역 함수가 있으면 번역값을 사용한다', () => {
  const t = createTranslation({ 'estimates.moveType.HOME': 'Home move' });

  assert.equal(formatAdminEstimateRequestMoveType('HOME', t), 'Home move');
});

test('견적 상태는 한글 라벨을 쓰고 번역 함수가 있으면 번역값을 사용한다', () => {
  assert.equal(formatAdminEstimateQuoteStatus('PENDING'), '대기');

  const t = createTranslation({
    'estimates.quoteStatus.CONFIRMED': 'Confirmed',
  });

  assert.equal(formatAdminEstimateQuoteStatus('CONFIRMED', t), 'Confirmed');
});

test('견적 금액이 없으면 대시를 반환하고 있으면 원화 형식으로 표시한다', () => {
  assert.equal(formatAdminEstimateQuotePrice(null), '-');
  assert.equal(
    formatAdminEstimateQuotePrice(15000),
    `${new Intl.NumberFormat('ko-KR').format(15000)}원`
  );
});

test('견적 금액 번역 함수가 있으면 포맷된 금액을 넘긴다', () => {
  const formattedPrice = new Intl.NumberFormat('ko-KR').format(15000);
  const t = (key, options) =>
    key === 'estimates.price' ? `${options.price} won` : key;

  assert.equal(
    formatAdminEstimateQuotePrice(15000, t),
    `${formattedPrice} won`
  );
});

test('누락 필드가 있을 때만 안내를 보여 준다', () => {
  assert.equal(hasAdminEstimateRequestMissingFields([]), false);
  assert.equal(hasAdminEstimateRequestMissingFields(['moveType']), true);
});

test('누락 필드는 한글 라벨로 바꾸고 알 수 없는 키는 원본을 유지한다', () => {
  assert.deepEqual(
    formatAdminEstimateRequestMissingFields(['moveType', 'unknownField']),
    ['이사 유형', 'unknownField']
  );
});

test('누락 필드 번역 함수가 있으면 번역값을 사용한다', () => {
  const t = createTranslation({ 'estimates.fields.moveType': 'Move type' });

  assert.deepEqual(formatAdminEstimateRequestMissingFields(['moveType'], t), [
    'Move type',
  ]);
});

test('통계 쿼리는 시작일이 없으면 전체 기간으로 둔다', () => {
  assert.equal(toAdminEstimateRequestStatisticsQuery(), undefined);
  assert.equal(
    toAdminEstimateRequestStatisticsQuery(undefined, '2026-08-21'),
    undefined
  );
});

test('통계 쿼리는 시작일만 있으면 startDate만 넣고 종료일이 있으면 둘 다 넣는다', () => {
  assert.deepEqual(toAdminEstimateRequestStatisticsQuery('2026-08-01'), {
    startDate: '2026-08-01',
  });
  assert.deepEqual(
    toAdminEstimateRequestStatisticsQuery('2026-08-01', '2026-08-21'),
    { startDate: '2026-08-01', endDate: '2026-08-21' }
  );
});
