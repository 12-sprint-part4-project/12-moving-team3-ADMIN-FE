import { format } from 'date-fns';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, type ChangeEvent } from 'react';

import { useDraftSearchFields } from '@/hooks/useDraftSearchFields';
import {
  createAdminReportListHref,
  parseAdminReportSearchParams,
} from '@/utils/adminListSearchParams';
import {
  toAdminReportDetailQuery,
  toAdminReportStatisticsQuery,
} from '@/utils/adminReport';
import {
  getSearchIdFieldErrors,
  hasSearchIdFieldErrors,
  type EstimateRequestSearchFieldErrors,
} from '@/utils/adminSearchFieldValidation';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

import {
  parseReportStatusFilter,
  parseReportTargetFilter,
} from '../_constants/reportFilters';

import type { DateRangePopoverProps } from '@/components/DateRangePopover/DateRangePopover';
import type { AdminReportListQuery } from '@/types/adminReport';
import type { AdminReportUrlFilters } from '@/utils/adminListSearchParams';

/** 화면에서 관리하는 필터 상태. API에 전달하지 않는 입력 초안은 별도 상태로 둔다. */
type AdminReportListFilters = AdminReportUrlFilters;

const toListQuery = (
  filters: AdminReportListFilters
): AdminReportListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  sort: filters.sort,
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.target ? { target: filters.target } : {}),
  ...(filters.id ? { id: filters.id } : {}),
  ...(filters.userName ? { userName: filters.userName } : {}),
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseAdminReportSearchParams(
        new URLSearchParams(searchParams.toString())
      ),
    [searchParams]
  );
  const urlSearchValues = useMemo(
    () => ({
      id: filters.id ?? '',
      userName: filters.userName ?? '',
    }),
    [filters.id, filters.userName]
  );
  const { drafts, handleFieldChange, commitDrafts, clearDrafts } =
    useDraftSearchFields(urlSearchValues);
  const [searchFieldErrors, setSearchFieldErrors] =
    useState<EstimateRequestSearchFieldErrors>({});

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const detailQuery = useMemo(
    () => toAdminReportDetailQuery(listQuery),
    [listQuery]
  );
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

  const updateFilters = useCallback(
    (
      patch: Partial<AdminReportListFilters>,
      options?: { resetPage?: boolean; replace?: boolean }
    ) => {
      const nextFilters = {
        ...filters,
        ...patch,
        ...(options?.resetPage ? { page: 1 } : {}),
      };
      const href = createAdminReportListHref(
        pathname,
        new URLSearchParams(window.location.search),
        nextFilters
      );

      navigateSearchHref(href, { replace: options?.replace });
    },
    [filters, pathname]
  );

  const handleSearchFieldChange =
    (key: 'id' | 'userName') => (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) =>
    updateFilters(
      { status: parseReportStatusFilter(event.target.value) },
      { resetPage: true }
    );

  const handleTargetChange = (event: ChangeEvent<HTMLSelectElement>) =>
    updateFilters(
      { target: parseReportTargetFilter(event.target.value) },
      { resetPage: true }
    );

  const handleDateRangeConfirm: DateRangePopoverProps['onConfirm'] = (
    range
  ) => {
    if (!range?.from) {
      updateFilters(
        { reportedFrom: undefined, reportedTo: undefined },
        { resetPage: true }
      );
      return;
    }

    updateFilters(
      {
        reportedFrom: format(range.from, 'yyyy-MM-dd'),
        // 종료일이 없으면 시작일 하루만 조회하도록 reportedTo를 생략한다.
        reportedTo: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
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

  const handleResetFilters = () => {
    clearDrafts();
    setSearchFieldErrors({});
    updateFilters({
      status: undefined,
      target: undefined,
      id: undefined,
      userName: undefined,
      reportedFrom: undefined,
      reportedTo: undefined,
      sort: 'DESC',
      page: 1,
    });
  };

  const replacePage = useCallback(
    (page: number) => updateFilters({ page }, { replace: true }),
    [updateFilters]
  );

  return {
    filters,
    searchDrafts: drafts,
    searchFieldErrors,
    listQuery,
    detailQuery,
    statisticsQuery,
    dateRangeValue,
    hasActiveFilters: Boolean(
      filters.status ||
      filters.target ||
      filters.id ||
      filters.userName ||
      filters.reportedFrom ||
      filters.reportedTo
    ),
    handleSearchFieldChange,
    handleSearch,
    handleStatusChange,
    handleTargetChange,
    handleDateRangeConfirm,
    handleSortToggle,
    handlePageChange: (page: number) => updateFilters({ page }),
    replacePage,
    handleResetFilters,
  };
};
