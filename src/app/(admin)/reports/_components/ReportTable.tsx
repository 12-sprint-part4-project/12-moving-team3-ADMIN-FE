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
  if (isPending) return <LoadingState />;

  if (isError) {
    return (
      <EmptyState
        title="신고 목록을 불러오지 못했습니다."
        description="잠시 후 다시 시도해 주세요."
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={
          hasActiveFilters ? '검색 결과가 없습니다.' : '등록된 신고가 없습니다.'
        }
        description={
          hasActiveFilters
            ? '검색 조건을 변경한 후 다시 시도해 주세요.'
            : undefined
        }
        action={
          hasActiveFilters ? (
            <Button variant="secondary" onClick={onResetFilters}>
              필터 초기화
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <DataTable columns={columns} data={items} rowKey="id" caption="신고 목록" />
  );
};
