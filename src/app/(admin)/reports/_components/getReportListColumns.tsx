import { Button } from '@/components/Button/Button';
import { SortableColumnHeader } from '@/components/SortableColumnHeader/SortableColumnHeader';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { TruncatedText } from '@/components/TruncatedText/TruncatedText';
import {
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  formatAdminReportCreatedAt,
  formatAdminReportReporter,
  formatAdminReportTarget,
} from '@/utils/adminReport';

import type { Column } from '@/components/DataTable/DataTable';
import type { AdminListSortDirection } from '@/types/adminEstimateRequest';
import type {
  AdminReportListItem,
  AdminReportTarget,
} from '@/types/adminReport';
import type { TFunction } from 'i18next';

const CONTENT_DELETION_SUPPORTED_TARGETS: ReadonlySet<AdminReportTarget> =
  new Set(['ARTICLE', 'COMMENT', 'REVIEW']);

const supportsContentDeletion = (row: AdminReportListItem) =>
  row.category === 'ABUSIVE_LANGUAGE' &&
  CONTENT_DELETION_SUPPORTED_TARGETS.has(row.target);

/** 신고 목록 표시 규칙과 상세 열기 액션을 컬럼 정의로 묶는다. */
export const getReportListColumns = (
  onOpenDetail: (reportId: number) => void,
  sort: AdminListSortDirection,
  onSortToggle: () => void,
  t: TFunction,
  locale: string
): Column<AdminReportListItem>[] => [
  { key: 'id', header: t('reports.fields.reportId'), accessor: 'id' },
  {
    key: 'status',
    header: t('reports.fields.status'),
    align: 'center',
    render: (row) => (
      <StatusBadge
        variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[row.status]}
        label={t(`reports.status.${row.status}`)}
      />
    ),
  },
  {
    key: 'target',
    header: t('reports.fields.targetType'),
    render: (row) => (
      <div className="flex items-center gap-2">
        <span>{t(`reports.target.${row.target}`)}</span>
        {supportsContentDeletion(row) ? (
          <StatusBadge
            variant="neutral"
            label={t('reports.contentDeletionSupported')}
          />
        ) : null}
      </div>
    ),
  },
  {
    key: 'category',
    header: t('reports.fields.category'),
    render: (row) => t(`reports.category.${row.category}`),
  },
  {
    key: 'reporter',
    header: t('reports.fields.reporter'),
    render: (row) => (
      <TruncatedText
        value={formatAdminReportReporter(row.reporter)}
        className="max-w-40"
      />
    ),
  },
  {
    key: 'targetInfo',
    header: t('reports.fields.target'),
    render: (row) => (
      <TruncatedText
        value={formatAdminReportTarget(row.target, row.targetInfo)}
        className="max-w-72"
      />
    ),
  },
  {
    key: 'createdAt',
    header: (
      <SortableColumnHeader
        label={t('reports.fields.createdAt')}
        sort={sort}
        onToggle={onSortToggle}
      />
    ),
    ariaSort: sort === 'ASC' ? 'ascending' : 'descending',
    render: (row) => formatAdminReportCreatedAt(row.createdAt, locale),
  },
  {
    key: 'actions',
    header: t('reports.fields.actions'),
    align: 'center',
    render: (row) => (
      <Button
        variant="secondary"
        className="px-3 py-1.5 text-sm-medium"
        onClick={() => onOpenDetail(row.id)}
      >
        {t('reports.viewDetail')}
      </Button>
    ),
  },
];
