import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { TruncatedText } from '@/components/TruncatedText/TruncatedText';
import {
  formatAdminMemberJoinedAt,
  formatAdminMemberPhoneNumber,
  getAdminMemberRowNumber,
} from '@/utils/adminMember';

import type { AdminMemberListColumnsContext } from '@/components/AdminMemberListView/AdminMemberListView';
import type { Column } from '@/components/DataTable/DataTable';
import type { AdminMemberListItem } from '@/types/adminMember';

/** 목록 API의 평균 평점이 없으면 빈 값 대신 대시를 표시한다. */
const formatAverageRating = (averageRating: number | null) => {
  if (averageRating == null) {
    return '-';
  }

  return averageRating.toFixed(1);
};

/** 기사 전용 필드인 닉네임과 평균 평점을 포함한 목록 컬럼을 생성한다. */
export const getDriverListColumns = (
  { page, pageSize, totalCount }: AdminMemberListColumnsContext,
  onOpenDetail: (memberId: string) => void
): Column<AdminMemberListItem>[] => [
  {
    key: 'index',
    header: '번호',
    render: (_row, index) =>
      getAdminMemberRowNumber(totalCount, page, pageSize, index),
  },
  {
    key: 'name',
    header: '이름',
    render: (row) => <TruncatedText value={row.name} className="max-w-28" />,
  },
  {
    key: 'nickname',
    header: '닉네임',
    render: (row) => (
      <TruncatedText value={row.nickname} className="max-w-28" />
    ),
  },
  {
    key: 'email',
    header: '이메일',
    render: (row) => <TruncatedText value={row.email} className="max-w-48" />,
  },
  {
    key: 'phoneNumber',
    header: '전화번호',
    render: (row) => (
      <TruncatedText
        value={formatAdminMemberPhoneNumber(row.phoneNumber)}
        className="max-w-32"
      />
    ),
  },
  {
    key: 'averageRating',
    header: '평점',
    align: 'center',
    render: (row) => formatAverageRating(row.averageRating),
  },
  {
    key: 'createdAt',
    header: '가입일',
    render: (row) => formatAdminMemberJoinedAt(row.createdAt),
  },
  {
    key: 'status',
    header: '계정 상태',
    align: 'center',
    render: (row) => (
      <StatusBadge
        variant={row.status === 'ACTIVE' ? 'success' : 'danger'}
        label={row.status === 'ACTIVE' ? '활성' : '정지'}
      />
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
        onClick={() => onOpenDetail(row.id)}
      >
        상세 보기
      </Button>
    ),
  },
];
