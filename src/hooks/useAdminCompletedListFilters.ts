import { useMemo, useState, type ChangeEvent } from 'react';

import {
  toAdminCompletedApiDate,
  toAdminCompletedStatisticsQuery,
} from '@/utils/adminCompleted';

import type { DateRangePopoverProps } from '@/components/DateRangePopover/DateRangePopover';
import type { AdminCompletedListQuery } from '@/types/adminCompleted';
import type { AdminEstimateRequestMoveType } from '@/types/adminEstimateRequest';

/** BE listQuerySchema 기본 페이지 크기와 동일 */
const DEFAULT_PAGE_SIZE = 10;

export interface AdminCompletedListFilters {
  /** 검색 버튼/Enter로 확정된 검색어 */
  search?: string;
  /** 미선택(전체) 시 undefined */
  moveType?: AdminEstimateRequestMoveType;
  /** 이사일 시작 (YYYY-MM-DD) */
  startDate?: string;
  /** 이사일 종료 (YYYY-MM-DD). startDate 없이 단독 사용하지 않는다 */
  endDate?: string;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: AdminCompletedListFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** select value → 이사 유형 | undefined. 알 수 없는 값은 무시한다. */
const parseMoveTypeFilter = (
  value: string
): AdminEstimateRequestMoveType | undefined => {
  if (value === 'SMALL' || value === 'HOME' || value === 'OFFICE') {
    return value;
  }

  return undefined;
};

/**
 * UI 필터 → API query.
 * undefined·빈 값은 객체에 넣지 않아 axios query string에서 빠진다.
 */
const toListQuery = (
  filters: AdminCompletedListFilters
): AdminCompletedListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.moveType ? { moveType: filters.moveType } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.startDate && filters.endDate ? { endDate: filters.endDate } : {}),
});

/**
 * 관리자 완료 건 목록 필터 상태·query 생성.
 * 검색·이사 유형·이사일·페이지와 통계 기간 query를 함께 만든다.
 * page 보정(setFilters)은 목록 응답을 아는 호출부에서 처리한다.
 */
export const useAdminCompletedListFilters = () => {
  const [filters, setFilters] =
    useState<AdminCompletedListFilters>(INITIAL_FILTERS);
  // 입력창 초안. 검색 버튼/Enter 시에만 filters.search로 반영한다.
  const [searchInput, setSearchInput] = useState('');

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const statisticsQuery = useMemo(
    () => toAdminCompletedStatisticsQuery(filters.startDate, filters.endDate),
    [filters.startDate, filters.endDate]
  );

  const hasActiveFilters = Boolean(
    filters.search || filters.moveType || filters.startDate || filters.endDate
  );

  const dateRangeValue = useMemo<DateRangePopoverProps['value']>(() => {
    if (!filters.startDate) {
      return undefined;
    }

    const from = new Date(`${filters.startDate}T00:00:00`);
    const to = filters.endDate ? new Date(`${filters.endDate}T00:00:00`) : from;

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return undefined;
    }

    return { from, to };
  }, [filters.startDate, filters.endDate]);

  const updateFilters = (
    patch: Partial<AdminCompletedListFilters>,
    options?: { resetPage?: boolean }
  ) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      ...(options?.resetPage ? { page: 1 } : {}),
    }));
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    setSearchInput(trimmed);
    updateFilters(
      { search: trimmed.length > 0 ? trimmed : undefined },
      { resetPage: true }
    );
  };

  const handleMoveTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { moveType: parseMoveTypeFilter(event.target.value) },
      { resetPage: true }
    );
  };

  const handleDateRangeConfirm: DateRangePopoverProps['onConfirm'] = (
    range
  ) => {
    if (!range?.from) {
      updateFilters(
        { startDate: undefined, endDate: undefined },
        { resetPage: true }
      );
      return;
    }

    updateFilters(
      {
        startDate: toAdminCompletedApiDate(range.from),
        // 종료일이 없으면 시작일 당일만 조회되도록 endDate를 생략한다.
        endDate: range.to ? toAdminCompletedApiDate(range.to) : undefined,
      },
      { resetPage: true }
    );
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters(INITIAL_FILTERS);
  };

  return {
    filters,
    setFilters,
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
    handleResetFilters,
  };
};
