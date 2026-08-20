'use client';

import { useState } from 'react';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useAdminCompletedList } from '@/hooks/useAdminCompletedList';
import { useAdminCompletedListFilters } from '@/hooks/useAdminCompletedListFilters';
import { useAdminCompletedStatistics } from '@/hooks/useAdminCompletedStatistics';
import { useClampListPage } from '@/hooks/useClampListPage';

import { CompletedDetailDrawer } from './CompletedDetailDrawer';
import { CompletedFilter } from './CompletedFilter';
import { CompletedStatistics } from './CompletedStatistics';
import { CompletedTable } from './CompletedTable';

/**
 * 관리자 완료 건 관리 화면 본문.
 * 필터·목록·통계·상세 Drawer를 조합한다.
 */
export const CompletedManagementContent = () => {
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
    handleMoveTypeChange,
    handleDateRangeConfirm,
    handlePageChange,
    setFilters,
    handleResetFilters,
  } = useAdminCompletedListFilters();

  const {
    data: listData,
    isPending: isListPending,
    isError: isListError,
    refetch: refetchList,
  } = useAdminCompletedList(listQuery);
  const {
    data: statisticsData,
    isPending: isStatisticsPending,
    isError: isStatisticsError,
  } = useAdminCompletedStatistics(statisticsQuery);

  useClampListPage({
    page: filters.page,
    totalPages: listData?.meta?.totalPages,
    isPending: isListPending,
    setFilters,
  });

  return (
    <>
      <PageHeader
        title="완료 건 관리"
        description="완료된 견적 요청 내역을 조회 할 수 있습니다."
      />
      <CompletedStatistics
        statistics={statisticsData?.data}
        isPending={isStatisticsPending}
        isError={isStatisticsError}
      />
      <CompletedFilter
        searchValue={searchInput}
        moveTypeValue={filters.moveType ?? ''}
        dateRangeValue={dateRangeValue}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onMoveTypeChange={handleMoveTypeChange}
        onDateRangeConfirm={handleDateRangeConfirm}
      />
      <CompletedTable
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
      <CompletedDetailDrawer
        open={selectedEstimateRequestId !== null}
        estimateRequestId={selectedEstimateRequestId}
        onClose={() => setSelectedEstimateRequestId(null)}
      />
    </>
  );
};
