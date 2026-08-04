'use client';

import type { ReactNode } from 'react';

import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminReportList } from '@/hooks/useAdminReportList';
import type { AdminReportListItem } from '@/types/adminReport';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  formatAdminReportCreatedAt,
  formatAdminReportReporter,
  formatAdminReportTarget,
} from '@/utils/adminReport';

const REPORT_COLUMNS: Column<AdminReportListItem>[] = [
  {
    key: 'id',
    header: '신고 ID',
    accessor: 'id',
  },
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
    render: (row) => formatAdminReportReporter(row.reporter),
  },
  {
    key: 'targetInfo',
    header: '신고 대상',
    className: 'max-w-72 truncate',
    // targetInfo null은 formatAdminReportTarget에서 fallback 문구로 처리한다.
    render: (row) => formatAdminReportTarget(row.target, row.targetInfo),
  },
  {
    key: 'createdAt',
    header: '신고일',
    render: (row) => formatAdminReportCreatedAt(row.createdAt),
  },
];

const ReportsPage = () => {
  const { data, isPending, isError } = useAdminReportList();
  const items = data?.data.items ?? [];

  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="신고 목록을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (items.length === 0) {
      return <EmptyState title="등록된 신고가 없습니다." />;
    }

    return (
      <DataTable
        columns={REPORT_COLUMNS}
        data={items}
        rowKey="id"
        caption="신고 목록"
      />
    );
  };

  return (
    <>
      <PageHeader
        title="신고 관리"
        description="신고 목록을 조회하고 상태를 확인할 수 있습니다."
      />

      <div className="mt-6 flex flex-col gap-4">
        <section className="rounded-lg border border-line-200 bg-white">
          {renderListBody()}
        </section>
      </div>
    </>
  );
};

export default ReportsPage;
