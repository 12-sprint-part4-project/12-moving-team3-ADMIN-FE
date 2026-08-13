'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { AdminReportDetailDrawer } from '@/components/AdminReportDetailDrawer/AdminReportDetailDrawer';
import { useAdminReportList } from '@/hooks/useAdminReportList';
import { useAdminReportStatistics } from '@/hooks/useAdminReportStatistics';

import { useAdminReportListFilters } from '../_hooks/useAdminReportListFilters';
import { getReportListColumns } from './getReportListColumns';
import { ReportFilter } from './ReportFilter';
import { ReportStatistics } from './ReportStatistics';
import { ReportTable } from './ReportTable';

/**
 * 신고 목록·통계 요청과 상세 Drawer를 조합하는 라우트 전용 컴포넌트.
 * 필터 상태와 표시 컴포넌트 사이의 데이터 연결만 담당한다.
 */
export const ReportManagementContent = () => {
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const {
    filters,
    setFilters,
    targetUserSearch,
    listQuery,
    statisticsQuery,
    dateRangeValue,
    hasActiveFilters,
    handleTargetUserSearchChange,
    handleTargetUserSearch,
    handleStatusChange,
    handleTargetChange,
    handleDateRangeConfirm,
    handlePageChange,
    handleResetFilters,
  } = useAdminReportListFilters();
  const { data, isPending, isError } = useAdminReportList(listQuery);
  const {
    data: statisticsData,
    isPending: isStatisticsPending,
    isError: isStatisticsError,
  } = useAdminReportStatistics(statisticsQuery);

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.page ?? filters.page;

  useEffect(() => {
    if (isPending || !pagination) return;

    const safePage = Math.max(pagination.totalPages, 1);
    // 처리 후 마지막 페이지가 사라지면 존재하는 마지막 페이지로 다시 조회한다.
    const timeoutId = window.setTimeout(() => {
      setFilters((previous) =>
        previous.page > safePage ? { ...previous, page: safePage } : previous
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isPending, pagination, setFilters]);

  const columns = useMemo(() => getReportListColumns(setSelectedReportId), []);

  return (
    <>
      <AdminListLayout
        title="신고 관리"
        description="신고 목록을 조회하고 상태를 확인할 수 있습니다."
        page={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        statistics={
          <ReportStatistics
            statistics={statisticsData?.data}
            isPending={isStatisticsPending}
            isError={isStatisticsError}
          />
        }
        filters={
          <ReportFilter
            searchValue={targetUserSearch}
            statusValue={filters.status ?? ''}
            targetValue={filters.target ?? ''}
            dateRangeValue={dateRangeValue}
            onSearchChange={handleTargetUserSearchChange}
            onSearch={handleTargetUserSearch}
            onStatusChange={handleStatusChange}
            onTargetChange={handleTargetChange}
            onDateRangeConfirm={handleDateRangeConfirm}
          />
        }
      >
        <ReportTable
          items={items}
          columns={columns}
          isPending={isPending}
          isError={isError}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={handleResetFilters}
        />
      </AdminListLayout>

      <AdminReportDetailDrawer
        open={selectedReportId !== null}
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </>
  );
};
