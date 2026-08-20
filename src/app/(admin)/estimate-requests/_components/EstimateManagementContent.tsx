'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useAdminEstimateRequestList } from '@/hooks/useAdminEstimateRequestList';
import { useAdminEstimateRequestListFilters } from '@/hooks/useAdminEstimateRequestListFilters';
import { useAdminEstimateRequestStatistics } from '@/hooks/useAdminEstimateRequestStatistics';
import { useClampListPage } from '@/hooks/useClampListPage';

import { EstimateDetailDrawer } from './EstimateDetailDrawer';
import { EstimateFilter } from './EstimateFilter';
import { EstimateStatistics } from './EstimateStatistics';
import { EstimateTable } from './EstimateTable';

/**
 * 관리자 견적 요청 관리 화면 본문.
 * 필터·목록·통계·상세 Drawer를 조합한다.
 */
export const EstimateManagementContent = () => {
  const [selectedEstimateRequestId, setSelectedEstimateRequestId] = useState<
    number | null
  >(null);
  const {
    filters,
    searchInput,
    listQuery,
    statisticsQuery,
    hasActiveFilters,
    dateRangeValue,
    handleSearchChange,
    handleSearch,
    handleStatusChange,
    handleDateRangeConfirm,
    handlePageChange,
    setFilters,
    handleResetFilters,
  } = useAdminEstimateRequestListFilters();

  const {
    data: listData,
    isPending: isListPending,
    isError: isListError,
    refetch: refetchList,
  } = useAdminEstimateRequestList(listQuery);
  const {
    data: statisticsData,
    isPending: isStatisticsPending,
    isError: isStatisticsError,
  } = useAdminEstimateRequestStatistics(statisticsQuery);

  useClampListPage({
    page: filters.page,
    totalPages: listData?.meta?.totalPages,
    isPending: isListPending,
    setFilters,
  });

  return (
    <>
      <PageHeader
        title="견적 요청 관리"
        description="견적 요청 내역을 조회 할 수 있습니다."
      />
      <EstimateStatistics
        statistics={statisticsData?.data}
        isPending={isStatisticsPending}
        isError={isStatisticsError}
      />
      <EstimateFilter
        searchValue={searchInput}
        statusValue={filters.status ?? ''}
        dateRangeValue={dateRangeValue}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onDateRangeConfirm={handleDateRangeConfirm}
      />
      <EstimateTable
        items={listData?.data ?? []}
        page={filters.page}
        totalPages={listData?.meta?.totalPages ?? 0}
        isLoading={isListPending}
        isError={isListError}
        hasActiveFilters={hasActiveFilters}
        onDetailClick={setSelectedEstimateRequestId}
        onPageChange={handlePageChange}
        onResetFilters={handleResetFilters}
        onRetry={() => void refetchList()}
      />
      <EstimateDetailDrawer
        estimateRequestId={selectedEstimateRequestId}
        onClose={() => setSelectedEstimateRequestId(null)}
      />
    </>
  );
};
