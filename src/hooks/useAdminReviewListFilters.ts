import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import {
  createAdminReviewListHref,
  parseAdminReviewSearchParams,
} from '@/utils/adminListSearchParams';
import {
  toAdminReviewApiDate,
  toAdminReviewStatisticsQuery,
} from '@/utils/adminReview';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

import type { DateRangePopoverProps } from '@/components/DateRangePopover/DateRangePopover';
import type {
  AdminReviewDeletionStatus,
  AdminReviewListQuery,
} from '@/types/adminReview';
import type { AdminReviewUrlFilters } from '@/utils/adminListSearchParams';

export type AdminReviewListFilters = AdminReviewUrlFilters;

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseAdminReviewSearchParams(
        new URLSearchParams(searchParams.toString())
      ),
    [searchParams]
  );
  // 입력창 초안. 검색 버튼/Enter 시에만 filters.search로 반영한다.
  const urlSearch = filters.search ?? '';
  const [syncedSearch, setSyncedSearch] = useState(urlSearch);
  const [searchInput, setSearchInput] = useState(urlSearch);

  if (syncedSearch !== urlSearch) {
    setSyncedSearch(urlSearch);
    setSearchInput(urlSearch);
  }

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

  const updateFilters = useCallback(
    (
      patch: Partial<AdminReviewListFilters>,
      options?: { resetPage?: boolean; replace?: boolean }
    ) => {
      const nextFilters = {
        ...filters,
        ...patch,
        ...(options?.resetPage ? { page: 1 } : {}),
      };
      const href = createAdminReviewListHref(
        pathname,
        new URLSearchParams(window.location.search),
        nextFilters
      );

      navigateSearchHref(href, { replace: options?.replace });
    },
    [filters, pathname]
  );

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

  const replacePage = useCallback(
    (page: number) => updateFilters({ page }, { replace: true }),
    [updateFilters]
  );

  const handleResetFilters = () => {
    setSearchInput('');
    updateFilters({
      search: undefined,
      rating: undefined,
      deletionStatus: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
    });
  };

  return {
    filters,
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
    replacePage,
    handleResetFilters,
  };
};
