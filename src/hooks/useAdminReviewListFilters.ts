import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import type { DateRangePopoverProps } from '@/components/DateRangePopover/DateRangePopover';
import type {
  AdminReviewDeletionStatus,
  AdminReviewListQuery,
} from '@/types/adminReview';
import {
  toAdminReviewApiDate,
  toAdminReviewStatisticsQuery,
} from '@/utils/adminReview';

/** BE listQuerySchema 기본 페이지 크기와 동일 */
const DEFAULT_PAGE_SIZE = 10;

export interface AdminReviewListFilters {
  /** 검색 버튼/Enter로 확정된 검색어 */
  search?: string;
  /** 1~5. 미선택 시 undefined */
  rating?: number;
  /** 미선택(전체) 시 undefined */
  deletionStatus?: AdminReviewDeletionStatus;
  /** 작성일 시작 (YYYY-MM-DD) */
  startDate?: string;
  /** 작성일 종료 (YYYY-MM-DD). startDate 없이 단독 사용하지 않는다 */
  endDate?: string;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: AdminReviewListFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** select value → 1~5 | undefined. 알 수 없는 값은 무시한다. */
const parseRatingFilter = (value: string): number | undefined => {
  if (
    value === '1' ||
    value === '2' ||
    value === '3' ||
    value === '4' ||
    value === '5'
  ) {
    return Number(value);
  }

  return undefined;
};

/** select value → ACTIVE | DELETED | undefined. 알 수 없는 값은 무시한다. */
const parseDeletionStatusFilter = (
  value: string
): AdminReviewDeletionStatus | undefined => {
  if (value === 'ACTIVE' || value === 'DELETED') {
    return value;
  }

  return undefined;
};

/**
 * UI 필터 → API query.
 * undefined·빈 값은 객체에 넣지 않아 axios query string에서 빠진다.
 */
const toListQuery = (
  filters: AdminReviewListFilters
): AdminReviewListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.rating !== undefined ? { rating: filters.rating } : {}),
  ...(filters.deletionStatus ? { deletionStatus: filters.deletionStatus } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.startDate && filters.endDate ? { endDate: filters.endDate } : {}),
});

/**
 * 관리자 리뷰 목록 필터 상태·query 생성.
 * 검색·별점·삭제상태·작성일·페이지와 통계 기간 query를 함께 만든다.
 * page 보정(setFilters)은 목록 응답을 아는 호출부에서 처리한다.
 */
export const useAdminReviewListFilters = () => {
  const [filters, setFilters] =
    useState<AdminReviewListFilters>(INITIAL_FILTERS);
  // 입력창 초안. 검색 버튼/Enter 시에만 filters.search로 반영한다.
  const [searchInput, setSearchInput] = useState('');

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const statisticsQuery = useMemo(
    () => toAdminReviewStatisticsQuery(filters.startDate, filters.endDate),
    [filters.startDate, filters.endDate]
  );

  // 삭제 상태가 선택된 경우에만 활성 필터로 본다.
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.rating !== undefined ||
    filters.startDate ||
    filters.endDate ||
    filters.deletionStatus !== undefined
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
    patch: Partial<AdminReviewListFilters>,
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

  const handleRatingChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { rating: parseRatingFilter(event.target.value) },
      { resetPage: true }
    );
  };

  const handleDeletionStatusChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    updateFilters(
      { deletionStatus: parseDeletionStatusFilter(event.target.value) },
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
        startDate: toAdminReviewApiDate(range.from),
        // 종료일이 없으면 시작일 당일만 조회되도록 endDate를 생략한다.
        endDate: range.to ? toAdminReviewApiDate(range.to) : undefined,
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

  const clampPage = useCallback((page: number) => {
    setFilters((previous) =>
      previous.page === page ? previous : { ...previous, page }
    );
  }, []);

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
    handleRatingChange,
    handleDeletionStatusChange,
    handleDateRangeConfirm,
    handlePageChange,
    clampPage,
    handleResetFilters,
  };
};
