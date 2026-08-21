'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useAdminEstimateRequestList } from '@/hooks/useAdminEstimateRequestList';
import { useAdminEstimateRequestListFilters } from '@/hooks/useAdminEstimateRequestListFilters';
import { useAdminEstimateRequestStatistics } from '@/hooks/useAdminEstimateRequestStatistics';
import { useClampListPage } from '@/hooks/useClampListPage';
import { useDetailSearchParam } from '@/hooks/useDetailSearchParam';
import { parseNumericDetailId } from '@/utils/detailSearchParams';

import { EstimateDetailDrawer } from './EstimateDetailDrawer';
import { EstimateFilter } from './EstimateFilter';
import { EstimateStatistics } from './EstimateStatistics';
import { EstimateTable } from './EstimateTable';

/**
 * 관리자 견적 요청 관리 화면 본문.
 * 필터·목록·통계·상세 Drawer를 조합한다.
 */
export const EstimateManagementContent = () => {
  const { t } = useTranslation();
  const { detailId, setDetailId } = useDetailSearchParam('estimateRequestId');
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
    handleStatusChange,
    handleDateRangeConfirm,
    handleSortToggle,
    handlePageChange,
    replacePage,
    handleResetFilters,
  } = useAdminEstimateRequestListFilters();

  const handleOpenDetail = useCallback(
    (estimateRequestId: number) => setDetailId(String(estimateRequestId)),
    [setDetailId]
  );

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
    onPageClamp: replacePage,
  });

  return (
    <>
      <PageHeader
        title={t('estimates.title')}
        description={t('estimates.description')}
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
        onReset={handleResetFilters}
      />
      <EstimateTable
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
      <EstimateDetailDrawer
        estimateRequestId={selectedEstimateRequestId}
        onClose={() => setDetailId(null)}
      />
    </>
  );
};
