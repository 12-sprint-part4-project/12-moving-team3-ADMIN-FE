'use client';

import { useCallback, useMemo } from 'react';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { useAdminReportList } from '@/hooks/useAdminReportList';
import { useAdminReportStatistics } from '@/hooks/useAdminReportStatistics';
import { useClampListPage } from '@/hooks/useClampListPage';
import { useDetailSearchParam } from '@/hooks/useDetailSearchParam';
import { parseNumericDetailId } from '@/utils/detailSearchParams';

import { useAdminReportListFilters } from '../_hooks/useAdminReportListFilters';
import { AdminReportDetailDrawer } from './AdminReportDetailDrawer/AdminReportDetailDrawer';
import { getReportListColumns } from './getReportListColumns';
import { ReportFilter } from './ReportFilter';
import { ReportStatistics } from './ReportStatistics';
import { ReportTable } from './ReportTable';

/**
 * 신고 목록·통계 요청과 상세 Drawer를 조합하는 라우트 전용 컴포넌트.
 * 필터 상태와 표시 컴포넌트 사이의 데이터 연결만 담당한다.
 */
export const ReportManagementContent = () => {
  const { detailId, setDetailId } = useDetailSearchParam('reportId');
  const selectedReportId = parseNumericDetailId(detailId);
  const {
    filters,
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
    setFilters,
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

  useClampListPage({
    page: filters.page,
    totalPages: pagination?.totalPages,
    isPending,
    setFilters,
  });

  const handleOpenDetail = useCallback(
    (reportId: number) => setDetailId(String(reportId)),
    [setDetailId]
  );
  const columns = useMemo(
    () => getReportListColumns(handleOpenDetail),
    [handleOpenDetail]
  );

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
        onClose={() => setDetailId(null)}
      />
    </>
  );
};
