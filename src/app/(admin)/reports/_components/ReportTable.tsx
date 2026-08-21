import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';

import type { AdminReportListItem } from '@/types/adminReport';

interface ReportTableProps {
  items: AdminReportListItem[];
  columns: Column<AdminReportListItem>[];
  isPending: boolean;
  isError: boolean;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

/** 목록 요청 상태에 따라 로딩, 오류, 빈 결과, 테이블을 일관된 순서로 표시한다. */
export const ReportTable = ({
  items,
  columns,
  isPending,
  isError,
  hasActiveFilters,
  onResetFilters,
}: ReportTableProps) => {
  const { t } = useTranslation();
  if (isPending) return <LoadingState />;

  if (isError) {
    return (
      <EmptyState
        title={t('reports.list.error')}
        description={t('reports.common.retry')}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={
          hasActiveFilters
            ? t('reports.list.noResults')
            : t('reports.list.empty')
        }
        description={
          hasActiveFilters ? t('reports.list.changeFilters') : undefined
        }
        action={
          hasActiveFilters ? (
            <Button variant="secondary" onClick={onResetFilters}>
              {t('reports.list.resetFilters')}
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <DataTable
      columns={columns}
      data={items}
      rowKey="id"
      caption={t('reports.list.label')}
    />
  );
};
