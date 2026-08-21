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
import type { TFunction } from 'i18next';

/** 일반 회원 목록에만 필요한 컬럼을 생성한다. */
export const getMemberListColumns = (
  { page, pageSize, totalCount }: AdminMemberListColumnsContext,
  onOpenDetail: (memberId: string) => void,
  t: TFunction
): Column<AdminMemberListItem>[] => [
  {
    key: 'index',
    header: t('members.columns.number'),
    render: (_row, index) =>
      getAdminMemberRowNumber(totalCount, page, pageSize, index),
  },
  {
    key: 'name',
    header: t('members.fields.name'),
    render: (row) => <TruncatedText value={row.name} className="max-w-32" />,
  },
  {
    key: 'email',
    header: t('members.fields.email'),
    render: (row) => <TruncatedText value={row.email} className="max-w-56" />,
  },
  {
    key: 'phoneNumber',
    header: t('members.fields.phone'),
    render: (row) => (
      <TruncatedText
        value={formatAdminMemberPhoneNumber(row.phoneNumber)}
        className="max-w-32"
      />
    ),
  },
  {
    key: 'createdAt',
    header: t('members.fields.joinedAt'),
    render: (row) => formatAdminMemberJoinedAt(row.createdAt),
  },
  {
    key: 'status',
    header: t('members.columns.status'),
    align: 'center',
    render: (row) => (
      <StatusBadge
        variant={row.status === 'ACTIVE' ? 'success' : 'danger'}
        label={t(
          row.status === 'ACTIVE'
            ? 'members.status.active'
            : 'members.status.suspended'
        )}
      />
    ),
  },
  {
    key: 'actions',
    header: t('members.columns.actions'),
    align: 'center',
    render: (row) => (
      <Button
        variant="secondary"
        className="px-3 py-1.5 text-sm-medium"
        onClick={() => onOpenDetail(row.id)}
      >
        {t('members.columns.viewDetail')}
      </Button>
    ),
  },
];
