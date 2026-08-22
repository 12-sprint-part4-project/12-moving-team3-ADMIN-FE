'use client';

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { detailId, setDetailId } = useDetailSearchParam('completedId');
  const selectedEstimateRequestId = parseNumericDetailId(detailId);
  const {
    filters,
    searchDrafts,
    searchFieldErrors,
    listQuery,
    detailQuery,
    statisticsQuery,
    hasActiveFilters,
    dateRangeValue,
    handleSearchFieldChange,
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
  const handleNavigateDetail = useCallback(
    (estimateRequestId: number) =>
      setDetailId(String(estimateRequestId), { replace: true }),
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
        title={t('completed.title')}
        description={t('completed.description')}
      />
      <CompletedStatistics
        statistics={statisticsData?.data}
        isPending={isStatisticsPending}
        isError={isStatisticsError}
      />
      <CompletedFilter
        searchDrafts={searchDrafts}
        searchFieldErrors={searchFieldErrors}
        moveTypeValue={filters.moveType ?? ''}
        dateRangeValue={dateRangeValue}
        onSearchFieldChange={handleSearchFieldChange}
        onSearch={handleSearch}
        onMoveTypeChange={handleMoveTypeChange}
        onDateRangeConfirm={handleDateRangeConfirm}
        onReset={handleResetFilters}
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
        detailQuery={detailQuery}
        onNavigate={handleNavigateDetail}
        onClose={() => setDetailId(null)}
      />
    </>
  );
};
