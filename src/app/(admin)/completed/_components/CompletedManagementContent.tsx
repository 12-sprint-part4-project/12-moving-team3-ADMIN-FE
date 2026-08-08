'use client';

import { useMemo, useState } from 'react';

import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useAdminCompletedList } from '@/hooks/useAdminCompletedList';
import { useAdminCompletedStatistics } from '@/hooks/useAdminCompletedStatistics';
import type { AdminCompletedListQuery } from '@/types/adminCompleted';
import type { AdminEstimateRequestMoveType } from '@/types/adminEstimateRequest';
import {
  toAdminCompletedApiDate,
  toAdminCompletedStatisticsQuery,
} from '@/utils/adminCompleted';

import { CompletedDetailDrawer } from './CompletedDetailDrawer';
import { CompletedFilter } from './CompletedFilter';
import { CompletedStatistics } from './CompletedStatistics';
import { CompletedTable } from './CompletedTable';

const DEFAULT_PAGE_SIZE = 10;

interface CompletedFilters {
  search?: string;
  moveType?: AdminEstimateRequestMoveType;
  startDate?: string;
  endDate?: string;
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [filters, setFilters] = useState<CompletedFilters>(INITIAL_FILTERS);

  const listQuery = useMemo<AdminCompletedListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.moveType ? { moveType: filters.moveType } : {}),
      ...(filters.startDate ? { startDate: filters.startDate } : {}),
      ...(filters.endDate ? { endDate: filters.endDate } : {}),
    }),
    [filters]
  );
  const statisticsQuery = useMemo(
    () => toAdminCompletedStatisticsQuery(dateRange),
    [dateRange]
  );
  const {
    data: listData,
    isPending: isListPending,
    isError: isListError,
    refetch: refetchList,
  } = useAdminCompletedList(listQuery);
  const { data: statisticsData } = useAdminCompletedStatistics(statisticsQuery);

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

  const handleSearch = (search: string) => {
    updateFilters({ search: search || undefined }, true);
  };

  const handleMoveTypeChange = (moveType?: AdminEstimateRequestMoveType) => {
    updateFilters({ moveType }, true);
  };

  const handleDateRangeConfirm = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from) {
      updateFilters({ startDate: undefined, endDate: undefined }, true);
      return;
    }

    updateFilters(
      {
        startDate: toAdminCompletedApiDate(range.from),
        endDate: range.to ? toAdminCompletedApiDate(range.to) : undefined,
      },
      true
    );
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setDateRange(undefined);
    setFilters(INITIAL_FILTERS);
    setFilterResetKey((previous) => previous + 1);
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.moveType || filters.startDate || filters.endDate
  );

  return (
    <>
      <PageHeader
        title="완료 건 관리"
        description="완료된 견적 요청 내역을 조회 할 수 있습니다."
      />
      <CompletedStatistics statistics={statisticsData?.data} />
      <CompletedFilter
        key={filterResetKey}
        moveType={filters.moveType}
        dateRange={dateRange}
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
