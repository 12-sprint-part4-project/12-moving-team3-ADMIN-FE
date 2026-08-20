'use client';

import { useCallback } from 'react';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useAdminCompletedList } from '@/hooks/useAdminCompletedList';
import { useAdminCompletedListFilters } from '@/hooks/useAdminCompletedListFilters';
import { useAdminCompletedStatistics } from '@/hooks/useAdminCompletedStatistics';
import { useClampListPage } from '@/hooks/useClampListPage';
import { useDetailSearchParam } from '@/hooks/useDetailSearchParam';
import { parseNumericDetailId } from '@/utils/detailSearchParams';

import { CompletedDetailDrawer } from './CompletedDetailDrawer';
import { CompletedFilter } from './CompletedFilter';
import { CompletedStatistics } from './CompletedStatistics';
import { CompletedTable } from './CompletedTable';

/**
 * 관리자 완료 건 관리 화면 본문.
 * 필터·목록·통계·상세 Drawer를 조합한다.
 */
export const CompletedManagementContent = () => {
  const { detailId, setDetailId } = useDetailSearchParam('completedId');
  const selectedEstimateRequestId = parseNumericDetailId(detailId);
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
    handleSortToggle,
    handlePageChange,
    replacePage,
    handleResetFilters,
  } = useAdminCompletedListFilters();

  const handleOpenDetail = useCallback(
    (estimateRequestId: number) => setDetailId(String(estimateRequestId)),
    [setDetailId]
  );

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
    onPageClamp: replacePage,
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
        onDetailClick={handleOpenDetail}
        onPageChange={handlePageChange}
        onResetFilters={handleResetFilters}
        onRetry={() => void refetchList()}
        sort={filters.sort}
        onSortToggle={handleSortToggle}
      />
      <CompletedDetailDrawer
        estimateRequestId={selectedEstimateRequestId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
};
