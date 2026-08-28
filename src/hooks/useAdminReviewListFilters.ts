import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import { useDraftSearchFields } from '@/hooks/useDraftSearchFields';
import {
  createAdminReviewListHref,
  parseAdminReviewSearchParams,
} from '@/utils/adminListSearchParams';
import {
  buildAdminReviewListQuery,
  toAdminReviewApiDate,
  toAdminReviewDetailQuery,
  toAdminReviewStatisticsQuery,
} from '@/utils/adminReview';
import {
  getSearchIdFieldErrors,
  hasSearchIdFieldErrors,
  type EstimateRequestSearchFieldErrors,
} from '@/utils/adminSearchFieldValidation';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

import type { DateRangePopoverProps } from '@/components/DateRangePopover/DateRangePopover';
import type { AdminReviewDeletionStatus } from '@/types/adminReview';
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
  const urlSearchValues = useMemo(
    () => ({
      id: filters.id ?? '',
      userName: filters.userName ?? '',
      moverName: filters.moverName ?? '',
    }),
    [filters.id, filters.userName, filters.moverName]
  );
  const { drafts, handleFieldChange, commitDrafts, clearDrafts } =
    useDraftSearchFields(urlSearchValues);
  const [searchFieldErrors, setSearchFieldErrors] =
    useState<EstimateRequestSearchFieldErrors>({});

  const listQuery = useMemo(() => buildAdminReviewListQuery(filters), [filters]);
  const detailQuery = useMemo(
    () => toAdminReviewDetailQuery(listQuery),
    [listQuery]
  );
  const statisticsQuery = useMemo(
    () => toAdminReviewStatisticsQuery(filters.startDate, filters.endDate),
    [filters.startDate, filters.endDate]
  );

  const hasActiveFilters = Boolean(
    filters.id ||
    filters.userName ||
    filters.moverName ||
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

  const handleSearchFieldChange =
    (key: 'id' | 'userName' | 'moverName') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (key === 'id') {
        setSearchFieldErrors((previous) => {
          if (!previous.id) {
            return previous;
          }

          const next = { ...previous };
          delete next.id;
          return next;
        });
      }

      handleFieldChange(key)(event);
    };

  const handleSearch = () => {
    const patch = commitDrafts();
    const errors = getSearchIdFieldErrors(patch.id ?? '');
    setSearchFieldErrors(errors);

    // 무효 필드가 있으면 URL·API에 반영하지 않는다.
    if (hasSearchIdFieldErrors(errors)) {
      return;
    }

    updateFilters(patch, { resetPage: true });
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

  // 정렬이 바뀌면 1페이지부터 다시 봐야 이전 페이지의 오래된 결과가 남지 않는다.
  const handleSortToggle = () => {
    updateFilters(
      { sort: filters.sort === 'DESC' ? 'ASC' : 'DESC' },
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
    clearDrafts();
    setSearchFieldErrors({});
    updateFilters({
      id: undefined,
      userName: undefined,
      moverName: undefined,
      rating: undefined,
      deletionStatus: undefined,
      startDate: undefined,
      endDate: undefined,
      sort: 'DESC',
      page: 1,
    });
  };

  return {
    filters,
    searchDrafts: drafts,
    searchFieldErrors,
    listQuery,
    detailQuery,
    statisticsQuery,
    hasActiveFilters,
    dateRangeValue,
    handleSearchFieldChange,
    handleSearch,
    handleRatingChange,
    handleDeletionStatusChange,
    handleDateRangeConfirm,
    handleSortToggle,
    handlePageChange,
    replacePage,
    handleResetFilters,
  };
};
