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

/** 일반 회원 목록에만 필요한 컬럼을 생성한다. */
export const getMemberListColumns = (
  { page, pageSize }: AdminMemberListColumnsContext,
  onOpenDetail: (memberId: string) => void
): Column<AdminMemberListItem>[] => [
  {
    key: 'index',
    header: '번호',
    render: (_row, index) => getAdminMemberRowNumber(page, pageSize, index),
  },
  {
    key: 'name',
    header: '이름',
    render: (row) => <TruncatedText value={row.name} className="max-w-32" />,
  },
  {
    key: 'email',
    header: '이메일',
    render: (row) => <TruncatedText value={row.email} className="max-w-56" />,
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
    key: 'createdAt',
    header: '가입일',
    render: (row) => formatAdminMemberJoinedAt(row.createdAt),
  },
  {
    key: 'status',
    header: '상태',
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
