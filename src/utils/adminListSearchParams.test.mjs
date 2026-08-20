import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAdminChatListHref,
  createAdminReportListHref,
  createAdminReviewListHref,
  parseAdminChatSearchParams,
  parseAdminReportSearchParams,
  parseAdminReviewSearchParams,
} from './adminListSearchParams.ts';

test('채팅 query를 복원하고 잘못된 값은 기본값으로 처리한다', () => {
  assert.deepEqual(
    parseAdminChatSearchParams(
      new URLSearchParams('search=%20%ED%99%8D%20&roomType=GENERAL&page=3')
    ),
    { search: '홍', roomType: 'GENERAL', page: 3, pageSize: 10 }
  );
  assert.deepEqual(
    parseAdminChatSearchParams(
      new URLSearchParams('search=%20&roomType=INVALID&page=0')
    ),
    { page: 1, pageSize: 10 }
  );
});

test('리뷰 query의 별점, 상태, 날짜 범위를 검증한다', () => {
  assert.deepEqual(
    parseAdminReviewSearchParams(
      new URLSearchParams(
        'search=review&rating=5&deletionStatus=DELETED&startDate=2026-08-01&endDate=2026-08-20&page=2'
      )
    ),
    {
      search: 'review',
      rating: 5,
      deletionStatus: 'DELETED',
      startDate: '2026-08-01',
      endDate: '2026-08-20',
      page: 2,
      pageSize: 10,
    }
  );
  assert.deepEqual(
    parseAdminReviewSearchParams(
      new URLSearchParams(
        'rating=6&deletionStatus=INVALID&startDate=2026-02-30&endDate=2026-01-01&page=x'
      )
    ),
    { page: 1, pageSize: 10 }
  );
});

test('신고 query의 상태, 대상, 날짜 범위를 검증한다', () => {
  assert.deepEqual(
    parseAdminReportSearchParams(
      new URLSearchParams(
        'status=PENDING&target=REVIEW&targetUserKeyword=%20user%20&reportedFrom=2026-08-01&reportedTo=2026-08-20&page=4'
      )
    ),
    {
      status: 'PENDING',
      target: 'REVIEW',
      targetUserKeyword: 'user',
      reportedFrom: '2026-08-01',
      reportedTo: '2026-08-20',
      page: 4,
      pageSize: 10,
    }
  );
});

test('목록 query를 갱신해도 상세 ID와 다른 query를 보존한다', () => {
  assert.equal(
    createAdminChatListHref(
      '/chats',
      new URLSearchParams('roomId=12&tab=participants&page=4'),
      { search: '홍길동', roomType: 'DESIGNATED', page: 1, pageSize: 10 }
    ),
    '/chats?roomId=12&tab=participants&search=%ED%99%8D%EA%B8%B8%EB%8F%99&roomType=DESIGNATED'
  );
  assert.equal(
    createAdminReportListHref(
      '/reports',
      new URLSearchParams('reportId=7&page=3'),
      { status: 'RESOLVED', page: 1, pageSize: 10 }
    ),
    '/reports?reportId=7&status=RESOLVED'
  );
  assert.equal(
    createAdminReviewListHref('/reviews', new URLSearchParams('view=compact'), {
      rating: 4,
      page: 2,
      pageSize: 10,
    }),
    '/reviews?view=compact&rating=4&page=2'
  );
});
