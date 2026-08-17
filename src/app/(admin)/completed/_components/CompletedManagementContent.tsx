'use client';

import { useMemo, useState, type ChangeEvent } from 'react';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useAdminCompletedList } from '@/hooks/useAdminCompletedList';
import { useAdminCompletedStatistics } from '@/hooks/useAdminCompletedStatistics';
import { useClampListPage } from '@/hooks/useClampListPage';
import { toAdminCompletedStatisticsQuery } from '@/utils/adminCompleted';

import { CompletedDetailDrawer } from './CompletedDetailDrawer';
import { CompletedFilter } from './CompletedFilter';
import { CompletedStatistics } from './CompletedStatistics';
import { CompletedTable } from './CompletedTable';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import type { AdminCompletedListQuery } from '@/types/adminCompleted';
import type { AdminEstimateRequestMoveType } from '@/types/adminEstimateRequest';

const DEFAULT_PAGE_SIZE = 10;

interface CompletedFilters {
  search?: string;
  moveType?: AdminEstimateRequestMoveType;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: CompletedFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const CompletedManagementContent = () => {
  const [selectedEstimateRequestId, setSelectedEstimateRequestId] = useState<
    number | null
  >(null);
  const [searchInput, setSearchInput] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filters, setFilters] = useState<CompletedFilters>(INITIAL_FILTERS);

  const dateQuery = useMemo(
    () => toAdminCompletedStatisticsQuery(dateRange),
    [dateRange]
  );
  const listQuery = useMemo<AdminCompletedListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.moveType ? { moveType: filters.moveType } : {}),
      ...dateQuery,
    }),
    [filters, dateQuery]
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
  } = useAdminCompletedStatistics(dateQuery);

  useClampListPage({
    page: filters.page,
    totalPages: listData?.meta?.totalPages,
    isPending: isListPending,
    setFilters,
  });

  const updateFilters = (
    patch: Partial<CompletedFilters>,
    resetPage = false
  ) => {
    setFilters((previous) => ({
      ...previous,
      ...patch,
      ...(resetPage ? { page: 1 } : {}),
    }));
  };

  const handleOpenDetail = (estimateRequestId: number) => {
    setSelectedEstimateRequestId(estimateRequestId);
  };

  const handleCloseDetail = () => {
    setSelectedEstimateRequestId(null);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = (search: string) => {
    const trimmed = search.trim();
    setSearchInput(trimmed);
    updateFilters({ search: trimmed || undefined }, true);
  };

  const handleMoveTypeChange = (moveType?: AdminEstimateRequestMoveType) => {
    updateFilters({ moveType }, true);
  };

  const handleDateRangeConfirm = (range: DateRange | undefined) => {
    setDateRange(range);
    updateFilters({}, true);
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setDateRange(undefined);
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.moveType || dateRange?.from
  );

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
        search={searchInput}
        moveType={filters.moveType}
        dateRange={dateRange}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        onMoveTypeChange={handleMoveTypeChange}
        onDateRangeConfirm={handleDateRangeConfirm}
      />
      <CompletedTable
        items={listData?.data ?? []}
        page={listData?.meta?.page ?? filters.page}
        totalPages={listData?.meta?.totalPages ?? 0}
        isLoading={isListPending}
        isError={isListError}
        hasActiveFilters={hasActiveFilters}
        onDetailClick={handleOpenDetail}
        onPageChange={handlePageChange}
        onResetFilters={handleResetFilters}
        onRetry={() => void refetchList()}
      />
      <CompletedDetailDrawer
        open={selectedEstimateRequestId !== null}
        estimateRequestId={selectedEstimateRequestId}
        onClose={handleCloseDetail}
      />
    </>
  );
};
