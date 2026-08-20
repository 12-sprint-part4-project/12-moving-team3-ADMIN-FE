import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import {
  formatAdminReviewCreatedAt,
  formatAdminReviewUserLabel,
} from '@/utils/adminReview';

import type { Column } from '@/components/DataTable/DataTable';
import type { AdminReviewListItem } from '@/types/adminReview';

/**
 * 관리자 리뷰 목록 DataTable 컬럼.
 * 상세 열기 핸들러만 외부에서 주입한다.
 */
export const getReviewListColumns = (
  onOpenDetail: (review: AdminReviewListItem) => void
): Column<AdminReviewListItem>[] => [
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
  {
    key: 'status',
    header: '상태',
    align: 'center',
    // deletedAt으로 활성/삭제됨을 한눈에 구분한다.
    render: (row) =>
      row.deletedAt == null ? (
        <StatusBadge variant="success" label="활성" />
      ) : (
        <StatusBadge variant="danger" label="삭제됨" />
      ),
  },
  {
    key: 'actions',
    header: '관리',
    align: 'center',
    render: (row) => (
      <Button
        variant="secondary"
        className="px-3 py-1.5 text-sm-medium"
        aria-label={`리뷰 ${row.id} 상세 보기`}
        onClick={() => onOpenDetail(row)}
      >
        상세 보기
      </Button>
    ),
  },
];
