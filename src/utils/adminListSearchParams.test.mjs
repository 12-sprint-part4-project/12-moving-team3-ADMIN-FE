import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createAdminChatListHref,
  createAdminCompletedListHref,
  createAdminEstimateRequestListHref,
  createAdminReportListHref,
  createAdminReviewListHref,
  parseAdminChatSearchParams,
  parseAdminCompletedSearchParams,
  parseAdminEstimateRequestSearchParams,
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
  assert.equal(
    createAdminEstimateRequestListHref(
      '/estimate-requests',
      new URLSearchParams('estimateRequestId=15&page=4'),
      { status: 'SUBMITTED', sort: 'DESC', page: 1, pageSize: 10 }
    ),
    '/estimate-requests?estimateRequestId=15&status=SUBMITTED'
  );
  assert.equal(
    createAdminEstimateRequestListHref(
      '/estimate-requests',
      new URLSearchParams('estimateRequestId=15'),
      { sort: 'ASC', page: 2, pageSize: 10 }
    ),
    '/estimate-requests?estimateRequestId=15&sort=ASC&page=2'
  );
  assert.equal(
    createAdminCompletedListHref(
      '/completed',
      new URLSearchParams('completedId=9&page=2&sort=ASC'),
      { moveType: 'HOME', sort: 'DESC', page: 1, pageSize: 10 }
    ),
    '/completed?completedId=9&moveType=HOME'
  );
});

test('견적 요청 query의 상태, 날짜, 정렬을 검증한다', () => {
  assert.deepEqual(
    parseAdminEstimateRequestSearchParams(
      new URLSearchParams(
        'search=%20%EA%B2%AC%EC%A0%81%20&status=CONFIRMED&startDate=2026-08-01&endDate=2026-08-20&sort=ASC&page=3'
      )
    ),
    {
      search: '견적',
      status: 'CONFIRMED',
      startDate: '2026-08-01',
      endDate: '2026-08-20',
      sort: 'ASC',
      page: 3,
      pageSize: 10,
    }
  );
  assert.deepEqual(
    parseAdminEstimateRequestSearchParams(
      new URLSearchParams(
        'search=%20&status=INVALID&startDate=2026-02-30&endDate=2026-01-01&sort=INVALID&page=0'
      )
    ),
    { sort: 'DESC', page: 1, pageSize: 10 }
  );
});

test('완료 건 query의 이사 유형, 날짜, 정렬을 검증한다', () => {
  assert.deepEqual(
    parseAdminCompletedSearchParams(
      new URLSearchParams(
        'search=%20user%20&moveType=OFFICE&startDate=2026-08-01&endDate=2026-08-20&sort=ASC&page=2'
      )
    ),
    {
      search: 'user',
      moveType: 'OFFICE',
      startDate: '2026-08-01',
      endDate: '2026-08-20',
      sort: 'ASC',
      page: 2,
      pageSize: 10,
    }
  );
  assert.deepEqual(
    parseAdminCompletedSearchParams(
      new URLSearchParams(
        'moveType=INVALID&startDate=2026-13-01&endDate=2026-01-01&sort=DOWN&page=x'
      )
    ),
    { sort: 'DESC', page: 1, pageSize: 10 }
  );
});
