import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { TruncatedText } from '@/components/TruncatedText/TruncatedText';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  formatAdminReportCreatedAt,
  formatAdminReportReporter,
  formatAdminReportTarget,
} from '@/utils/adminReport';

import type { Column } from '@/components/DataTable/DataTable';
import type { AdminReportListItem } from '@/types/adminReport';

/** 신고 목록 표시 규칙과 상세 열기 액션을 컬럼 정의로 묶는다. */
export const getReportListColumns = (
  onOpenDetail: (reportId: number) => void
): Column<AdminReportListItem>[] => [
  { key: 'id', header: '신고 ID', accessor: 'id' },
  {
    key: 'status',
    header: '상태',
    align: 'center',
    render: (row) => (
      <StatusBadge
        variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[row.status]}
        label={ADMIN_REPORT_STATUS_LABEL[row.status]}
      />
    ),
  },
  {
    key: 'target',
    header: '대상 유형',
    render: (row) => ADMIN_REPORT_TARGET_LABEL[row.target],
  },
  {
    key: 'category',
    header: '신고 유형',
    render: (row) => ADMIN_REPORT_CATEGORY_LABEL[row.category],
  },
  {
    key: 'reporter',
    header: '신고자',
    render: (row) => (
      <TruncatedText
        value={formatAdminReportReporter(row.reporter)}
        className="max-w-40"
      />
    ),
  },
  {
    key: 'targetInfo',
    header: '신고 대상',
    render: (row) => (
      <TruncatedText
        value={formatAdminReportTarget(row.target, row.targetInfo)}
        className="max-w-72"
      />
    ),
  },
  {
    key: 'createdAt',
    header: '신고일',
    render: (row) => formatAdminReportCreatedAt(row.createdAt),
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
