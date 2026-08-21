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
  onOpenDetail: (memberId: string) => void,
  t: TFunction,
  locale: string
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
    render: (row) => <TruncatedText value={row.name} className="max-w-28" />,
  },
  {
    key: 'nickname',
    header: t('members.fields.nickname'),
    render: (row) => (
      <TruncatedText value={row.nickname} className="max-w-28" />
    ),
  },
  {
    key: 'email',
    header: t('members.fields.email'),
    render: (row) => <TruncatedText value={row.email} className="max-w-48" />,
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
    key: 'averageRating',
    header: t('members.fields.rating'),
    align: 'center',
    render: (row) => formatAverageRating(row.averageRating),
  },
  {
    key: 'createdAt',
    header: t('members.fields.joinedAt'),
    render: (row) => formatAdminMemberJoinedAt(row.createdAt, locale),
  },
  {
    key: 'status',
    header: t('members.detail.accountStatus'),
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
