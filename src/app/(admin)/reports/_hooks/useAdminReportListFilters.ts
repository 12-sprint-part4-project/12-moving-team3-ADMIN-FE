import { format } from 'date-fns';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import type { DateRangePopoverProps } from '@/components/DateRangePopover/DateRangePopover';
import type {
  AdminReportListQuery,
  AdminReportStatus,
  AdminReportTarget,
} from '@/types/adminReport';
import { toAdminReportStatisticsQuery } from '@/utils/adminReport';

import {
  parseReportStatusFilter,
  parseReportTargetFilter,
} from '../_constants/reportFilters';

const DEFAULT_PAGE_SIZE = 10;

/** 화면에서 관리하는 필터 상태. API에 전달하지 않는 입력 초안은 별도 상태로 둔다. */
interface AdminReportListFilters {
  status?: AdminReportStatus;
  target?: AdminReportTarget;
  targetUserKeyword?: string;
  reportedFrom?: string;
  reportedTo?: string;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: AdminReportListFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const toListQuery = (
  filters: AdminReportListFilters
): AdminReportListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.target ? { target: filters.target } : {}),
  ...(filters.targetUserKeyword
    ? { targetUserKeyword: filters.targetUserKeyword }
    : {}),
  ...(filters.reportedFrom ? { reportedFrom: filters.reportedFrom } : {}),
  ...(filters.reportedFrom && filters.reportedTo
    ? { reportedTo: filters.reportedTo }
    : {}),
});

/**
 * 신고 목록의 검색·필터·페이지 상태와 API Query 변환을 담당한다.
 * 검색어는 버튼 또는 Enter로 확정될 때만 Query에 반영한다.
 */
export const useAdminReportListFilters = () => {
  const [filters, setFilters] =
    useState<AdminReportListFilters>(INITIAL_FILTERS);
  const [targetUserSearch, setTargetUserSearch] = useState('');

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const statisticsQuery = useMemo(
    () =>
      toAdminReportStatisticsQuery(filters.reportedFrom, filters.reportedTo),
    [filters.reportedFrom, filters.reportedTo]
  );
  // DateRangePopover에는 Date를 전달하고 API Query에는 YYYY-MM-DD 문자열을 유지한다.
  const dateRangeValue = useMemo<DateRangePopoverProps['value']>(() => {
    if (!filters.reportedFrom) return undefined;

    const from = new Date(`${filters.reportedFrom}T00:00:00`);
    const to = filters.reportedTo
      ? new Date(`${filters.reportedTo}T00:00:00`)
      : from;

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return undefined;
    }

    return { from, to };
  }, [filters.reportedFrom, filters.reportedTo]);

  const updateFilters = (
    patch: Partial<AdminReportListFilters>,
    resetPage = false
  ) => {
    setFilters((previous) => ({
      ...previous,
      ...patch,
      ...(resetPage ? { page: 1 } : {}),
    }));
  };

  const handleTargetUserSearchChange = (event: ChangeEvent<HTMLInputElement>) =>
    setTargetUserSearch(event.target.value);

  const handleTargetUserSearch = (value: string) => {
    const trimmed = value.trim();
    setTargetUserSearch(trimmed);
    updateFilters(
      { targetUserKeyword: trimmed.length > 0 ? trimmed : undefined },
      true
    );
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) =>
    updateFilters(
      { status: parseReportStatusFilter(event.target.value) },
      true
    );

  const handleTargetChange = (event: ChangeEvent<HTMLSelectElement>) =>
    updateFilters(
      { target: parseReportTargetFilter(event.target.value) },
      true
    );

  const handleDateRangeConfirm: DateRangePopoverProps['onConfirm'] = (
    range
  ) => {
    if (!range?.from) {
      updateFilters({ reportedFrom: undefined, reportedTo: undefined }, true);
      return;
    }

    updateFilters(
      {
        reportedFrom: format(range.from, 'yyyy-MM-dd'),
        // 종료일이 없으면 시작일 하루만 조회하도록 reportedTo를 생략한다.
        reportedTo: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
      },
      true
    );
  };

  const handleResetFilters = () => {
    setTargetUserSearch('');
    setFilters(INITIAL_FILTERS);
  };

  const clampPage = useCallback((page: number) => {
    setFilters((previous) =>
      previous.page === page ? previous : { ...previous, page }
    );
  }, []);

  return {
    filters,
    setFilters,
    targetUserSearch,
    listQuery,
    statisticsQuery,
    dateRangeValue,
    hasActiveFilters: Boolean(
      filters.status ||
      filters.target ||
      filters.targetUserKeyword ||
      filters.reportedFrom ||
      filters.reportedTo
    ),
    handleTargetUserSearchChange,
    handleTargetUserSearch,
    handleStatusChange,
    handleTargetChange,
    handleDateRangeConfirm,
    handlePageChange: (page: number) => updateFilters({ page }),
    clampPage,
    handleResetFilters,
  };
};
