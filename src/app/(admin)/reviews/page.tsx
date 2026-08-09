'use client';

import { useMemo } from 'react';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { useAdminReviewStatistics } from '@/hooks/useAdminReviewStatistics';
import type { AdminReviewListItem } from '@/types/adminReview';
import {
  formatAdminReviewCreatedAt,
  formatAdminReviewUserLabel,
} from '@/utils/adminReview';

import { ReviewStatistics } from './_components/ReviewStatistics';

/**
 * UI 확인용 임시 데이터.
 * 다음 TODO(API 연동)에서 제거하고 실제 목록 응답으로 교체한다.
 */
const PLACEHOLDER_REVIEWS: AdminReviewListItem[] = [
  {
    id: 1,
    userId: '00000000-0000-4000-8000-000000000001',
    quoteId: 10,
    rating: 5,
    content:
      '기사님이 시간 약속을 잘 지켜 주셨고, 짐도 꼼꼼하게 포장해 주셔서 만족스러웠습니다.',
    createdAt: '2026-08-01T09:30:00.000Z',
    updatedAt: null,
    author: {
      id: '00000000-0000-4000-8000-000000000001',
      name: '홍길동',
      nickname: '길동이',
      email: 'customer@example.com',
      userType: 'CUSTOMER',
    },
    mover: {
      id: '00000000-0000-4000-8000-000000000002',
      name: '김기사',
      nickname: '기사킴',
      email: 'mover@example.com',
      userType: 'MOVER',
    },
  },
  {
    id: 2,
    userId: '00000000-0000-4000-8000-000000000003',
    quoteId: 11,
    rating: 4,
    content: '전반적으로 좋았지만 도착이 조금 늦었습니다.',
    createdAt: '2026-08-02T14:15:00.000Z',
    updatedAt: null,
    author: {
      id: '00000000-0000-4000-8000-000000000003',
      name: '이고객',
      nickname: '이고객',
      email: 'lee@example.com',
      userType: 'CUSTOMER',
    },
    // mover nullable UI 확인용
    mover: null,
  },
];

const ReviewsPage = () => {
  const { data, isPending, isError } = useAdminReviewStatistics();

  const columns = useMemo(
    (): Column<AdminReviewListItem>[] => [
      {
        key: 'id',
        header: '리뷰 ID',
        accessor: 'id',
      },
      {
        key: 'author',
        header: '작성자',
        className: 'max-w-56',
        render: (row) => (
          <div className="flex min-w-0 flex-col gap-0.5">
            <span
              className="truncate"
              title={formatAdminReviewUserLabel(row.author)}
            >
              {formatAdminReviewUserLabel(row.author)}
            </span>
            <span
              className="truncate text-sm-medium text-gray-500"
              title={row.author.email}
            >
              {row.author.email}
            </span>
          </div>
        ),
      },
      {
        key: 'mover',
        header: '기사',
        className: 'max-w-56',
        // 회원 목록 phoneNumber와 동일하게 null은 '-'로 표시한다.
        render: (row) => {
          if (!row.mover) {
            return '-';
          }

          return (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span
                className="truncate"
                title={formatAdminReviewUserLabel(row.mover)}
              >
                {formatAdminReviewUserLabel(row.mover)}
              </span>
              <span
                className="truncate text-sm-medium text-gray-500"
                title={row.mover.email}
              >
                {row.mover.email}
              </span>
            </div>
          );
        },
      },
      {
        key: 'rating',
        header: '별점',
        align: 'center',
        render: (row) => row.rating,
      },
      {
        key: 'content',
        header: '리뷰 내용',
        className: 'max-w-72',
        // 신고/채팅 목록과 동일하게 truncate + title로 전체 문구를 제공한다.
        render: (row) => (
          <span className="block truncate" title={row.content}>
            {row.content}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: '작성일',
        render: (row) => formatAdminReviewCreatedAt(row.createdAt),
      },
    ],
    []
  );

  return (
    <AdminListLayout
      title="리뷰 관리"
      description="리뷰 목록을 확인하고 작성자·기사 정보를 조회할 수 있습니다."
      statistics={
        <ReviewStatistics
          statistics={data?.data}
          isPending={isPending}
          isError={isError}
        />
      }
    >
      <DataTable
        columns={columns}
        data={PLACEHOLDER_REVIEWS}
        rowKey="id"
        caption="리뷰 목록"
      />
    </AdminListLayout>
  );
};

export default ReviewsPage;
