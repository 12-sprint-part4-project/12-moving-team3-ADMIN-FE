import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import { useDraftSearchFields } from '@/hooks/useDraftSearchFields';
import {
  toAdminEstimateRequestApiDate,
  toAdminEstimateRequestDetailQuery,
  toAdminEstimateRequestStatisticsQuery,
} from '@/utils/adminEstimateRequest';
import {
  createAdminEstimateRequestListHref,
  ESTIMATE_REQUEST_STATUSES,
  parseAdminEstimateRequestSearchParams,
  parseAdminListEnum,
} from '@/utils/adminListSearchParams';
import {
  getEstimateRequestSearchFieldErrors,
  hasEstimateRequestSearchFieldErrors,
  type EstimateRequestSearchFieldErrors,
} from '@/utils/adminSearchFieldValidation';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

import type { DateRangePopoverProps } from '@/components/DateRangePopover/DateRangePopover';
import type { AdminEstimateRequestListQuery } from '@/types/adminEstimateRequest';
import type { AdminEstimateRequestUrlFilters } from '@/utils/adminListSearchParams';

export type AdminEstimateRequestListFilters = AdminEstimateRequestUrlFilters;

/**
 * UI 필터 → 목록 API query.
 * undefined·빈 값은 객체에 넣지 않아 axios query string에서 빠진다.
 */
const toListQuery = (
  filters: AdminEstimateRequestListFilters
): AdminEstimateRequestListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...toAdminEstimateRequestDetailQuery(filters),
});

/**
 * 관리자 견적 요청 목록 필터 상태·query 생성.
 * 검색·상태·제출일·정렬·페이지와 통계 기간 query를 URL에서 복원한다.
 */
export const useAdminEstimateRequestListFilters = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseAdminEstimateRequestSearchParams(
        new URLSearchParams(searchParams.toString())
      ),
    [searchParams]
  );
  // 입력창 초안. 검색 버튼/Enter 시에만 URL 검색 필드로 반영한다.
  const urlSearchValues = useMemo(
    () => ({
      id: filters.id ?? '',
      userName: filters.userName ?? '',
      phoneNumber: filters.phoneNumber ?? '',
    }),
    [filters.id, filters.userName, filters.phoneNumber]
  );
  const { drafts, handleFieldChange, commitDrafts, clearDrafts } =
    useDraftSearchFields(urlSearchValues);
  const [searchFieldErrors, setSearchFieldErrors] =
    useState<EstimateRequestSearchFieldErrors>({});

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const detailQuery = useMemo(
    () => toAdminEstimateRequestDetailQuery(filters),
    [filters]
  );
  const statisticsQuery = useMemo(
    () =>
      toAdminEstimateRequestStatisticsQuery(filters.startDate, filters.endDate),
    [filters.startDate, filters.endDate]
  );

  const hasActiveFilters = Boolean(
    filters.id ||
    filters.userName ||
    filters.phoneNumber ||
    filters.status ||
    filters.startDate ||
    filters.endDate
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
      patch: Partial<AdminEstimateRequestListFilters>,
      options?: { resetPage?: boolean; replace?: boolean }
    ) => {
      const nextFilters = {
        ...filters,
        ...patch,
        ...(options?.resetPage ? { page: 1 } : {}),
      };
      const href = createAdminEstimateRequestListHref(
        pathname,
        new URLSearchParams(window.location.search),
        nextFilters
      );

      navigateSearchHref(href, { replace: options?.replace });
    },
    [filters, pathname]
  );

  const handleSearchFieldChange =
    (key: 'id' | 'userName' | 'phoneNumber') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (key === 'id' || key === 'phoneNumber') {
        setSearchFieldErrors((previous) => {
          if (!previous[key]) {
            return previous;
          }

          const next = { ...previous };
          delete next[key];
          return next;
        });
      }

      handleFieldChange(key)(event);
    };

  const handleSearch = () => {
    const patch = commitDrafts();
    const errors = getEstimateRequestSearchFieldErrors({
      id: patch.id ?? '',
      phoneNumber: patch.phoneNumber ?? '',
    });
    setSearchFieldErrors(errors);

    // 무효 필드가 있으면 URL·API에 반영하지 않는다.
    if (hasEstimateRequestSearchFieldErrors(errors)) {
      return;
    }

    updateFilters(patch, { resetPage: true });
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      {
        status: parseAdminListEnum(
          event.target.value,
          ESTIMATE_REQUEST_STATUSES
        ),
      },
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
        startDate: toAdminEstimateRequestApiDate(range.from),
        // 종료일이 없으면 시작일 당일만 조회되도록 endDate를 생략한다.
        endDate: range.to ? toAdminEstimateRequestApiDate(range.to) : undefined,
      },
      { resetPage: true }
    );
  };

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
      phoneNumber: undefined,
      status: undefined,
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
    handleStatusChange,
    handleDateRangeConfirm,
    handleSortToggle,
    handlePageChange,
    replacePage,
    handleResetFilters,
  };
};
