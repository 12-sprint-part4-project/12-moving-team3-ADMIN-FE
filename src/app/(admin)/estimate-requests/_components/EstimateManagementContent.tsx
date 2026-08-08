'use client';

import { useMemo, useState } from 'react';

import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { DateRange } from '@/components/DateRangePicker/DateRangePicker';
import { useAdminEstimateRequestList } from '@/hooks/useAdminEstimateRequestList';
import { useAdminEstimateRequestStatistics } from '@/hooks/useAdminEstimateRequestStatistics';
import type {
  AdminEstimateRequestListQuery,
  AdminEstimateRequestStatus,
} from '@/types/adminEstimateRequest';
import {
  toAdminEstimateRequestApiDate,
  toAdminEstimateRequestStatisticsQuery,
} from '@/utils/adminEstimateRequest';

import { EstimateDetailDrawer } from './EstimateDetailDrawer';
import { EstimateFilter } from './EstimateFilter';
import { EstimateStatistics } from './EstimateStatistics';
import { EstimateTable } from './EstimateTable';

const DEFAULT_PAGE_SIZE = 10;

interface EstimateRequestFilters {
  search?: string;
  status?: AdminEstimateRequestStatus;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: EstimateRequestFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

export const EstimateManagementContent = () => {
  const [selectedEstimateRequestId, setSelectedEstimateRequestId] = useState<
    number | null
  >(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterResetKey, setFilterResetKey] = useState(0);
  const [filters, setFilters] =
    useState<EstimateRequestFilters>(INITIAL_FILTERS);

  const listQuery = useMemo<AdminEstimateRequestListQuery>(
    () => ({
      page: filters.page,
      pageSize: filters.pageSize,
      ...(filters.search ? { search: filters.search } : {}),
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.startDate ? { startDate: filters.startDate } : {}),
      ...(filters.endDate ? { endDate: filters.endDate } : {}),
    }),
    [filters]
  );
  const statisticsQuery = useMemo(
    () => toAdminEstimateRequestStatisticsQuery(dateRange),
    [dateRange]
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

  const updateFilters = (
    patch: Partial<EstimateRequestFilters>,
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

  const handleStatusChange = (status?: AdminEstimateRequestStatus) => {
    updateFilters({ status }, true);
  };

  const handleDateRangeConfirm = (range: DateRange | undefined) => {
    setDateRange(range);

    if (!range?.from) {
      updateFilters({ startDate: undefined, endDate: undefined }, true);
      return;
    }

    updateFilters(
      {
        startDate: toAdminEstimateRequestApiDate(range.from),
        endDate: range.to ? toAdminEstimateRequestApiDate(range.to) : undefined,
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
    filters.search || filters.status || filters.startDate || filters.endDate
  );

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
        key={filterResetKey}
        status={filters.status}
        dateRange={dateRange}
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onDateRangeConfirm={handleDateRangeConfirm}
      />
      <EstimateTable
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
      <EstimateDetailDrawer
        open={selectedEstimateRequestId !== null}
        estimateRequestId={selectedEstimateRequestId}
        onClose={handleCloseDetail}
      />
    </>
  );
};
