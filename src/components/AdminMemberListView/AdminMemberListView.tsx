'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import {
  DateRangePopover,
  type DateRangePopoverProps,
} from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { MultiFieldSearch } from '@/components/MultiFieldSearch/MultiFieldSearch';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';
import { useAdminMemberList } from '@/hooks/useAdminMemberList';
import { useClampListPage } from '@/hooks/useClampListPage';
import { useDraftSearchFields } from '@/hooks/useDraftSearchFields';
import { toAdminMemberApiDate } from '@/utils/adminMember';
import {
  createAdminMemberListHref,
  INITIAL_ADMIN_MEMBER_LIST_FILTERS,
  parseAdminMemberListSearchParams,
} from '@/utils/adminMemberListSearchParams';
import {
  getPhoneNumberSearchFieldErrors,
  hasEstimateRequestSearchFieldErrors,
  type EstimateRequestSearchFieldErrors,
} from '@/utils/adminSearchFieldValidation';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

import type {
  AdminMemberListItem,
  AdminMemberListQuery,
  AdminMemberSortOrder,
  MemberStatus,
  MemberUserType,
} from '@/types/adminMember';
import type { AdminMemberListFilters } from '@/utils/adminMemberListSearchParams';

export type { AdminMemberListFilters } from '@/utils/adminMemberListSearchParams';

/** 상태 필터: 빈 문자열은 status 미전달(전체) */
/** select value → MemberStatus | undefined. 알 수 없는 값은 무시한다. */
const parseMemberStatusFilter = (value: string): MemberStatus | undefined => {
  if (value === 'ACTIVE' || value === 'SUSPENDED') {
    return value;
  }

  return undefined;
};

const toListQuery = (
  userType: MemberUserType,
  filters: AdminMemberListFilters
): AdminMemberListQuery => ({
  userType,
  page: filters.page,
  pageSize: filters.pageSize,
  sort: filters.sort,
  ...(filters.userName ? { userName: filters.userName } : {}),
  ...(filters.email ? { email: filters.email } : {}),
  ...(filters.phoneNumber ? { phoneNumber: filters.phoneNumber } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.endDate ? { endDate: filters.endDate } : {}),
});

export interface AdminMemberListColumnsContext {
  page: number;
  pageSize: number;
  totalCount: number;
  sort: AdminMemberSortOrder;
  onSortToggle: () => void;
}

export interface AdminMemberListViewProps {
  userType: MemberUserType;
  title: string;
  description: string;
  caption: string;
  /** 필터 없을 때 빈 목록 제목 */
  emptyNoDataTitle: string;
  /** 조회 실패 시 제목 */
  errorTitle: string;
  getColumns: (
    context: AdminMemberListColumnsContext
  ) => Column<AdminMemberListItem>[];
}

/**
 * 관리자 회원/기사 목록 공통 화면.
 * 검색·상태·가입일·페이지네이션과 Loading/Empty/Table 구조를 공유한다.
 */
export const AdminMemberListView = ({
  userType,
  title,
  description,
  caption,
  emptyNoDataTitle,
  errorTitle,
  getColumns,
}: AdminMemberListViewProps) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseAdminMemberListSearchParams(
        new URLSearchParams(searchParams.toString())
      ),
    [searchParams]
  );
  // 입력창 초안. 검색 버튼/Enter 시에만 URL 검색 필드로 반영한다.
  const urlSearchValues = useMemo(
    () => ({
      userName: filters.userName ?? '',
      email: filters.email ?? '',
      phoneNumber: filters.phoneNumber ?? '',
    }),
    [filters.userName, filters.email, filters.phoneNumber]
  );
  const { drafts, handleFieldChange, commitDrafts, clearDrafts } =
    useDraftSearchFields(urlSearchValues);
  const [searchFieldErrors, setSearchFieldErrors] =
    useState<EstimateRequestSearchFieldErrors>({});

  const listQuery = useMemo(
    () => toListQuery(userType, filters),
    [userType, filters]
  );
  const { data, isPending, isError } = useAdminMemberList(listQuery);

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalCount = pagination?.totalCount ?? 0;
  const currentPage = filters.page;

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
      patch: Partial<AdminMemberListFilters>,
      options?: { resetPage?: boolean; replace?: boolean }
    ) => {
      const nextFilters = {
        ...filters,
        ...patch,
        ...(options?.resetPage ? { page: 1 } : {}),
      };
      const href = createAdminMemberListHref(
        pathname,
        new URLSearchParams(window.location.search),
        nextFilters
      );

      navigateSearchHref(href, { replace: options?.replace });
    },
    [filters, pathname]
  );

  const handlePageClamp = useCallback(
    (page: number) => updateFilters({ page }, { replace: true }),
    [updateFilters]
  );

  useClampListPage({
    page: filters.page,
    totalPages: pagination?.totalPages,
    isPending,
    onPageClamp: handlePageClamp,
  });

  const handleSearchFieldChange =
    (key: 'userName' | 'email' | 'phoneNumber') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      if (key === 'phoneNumber') {
        setSearchFieldErrors((previous) => {
          if (!previous.phoneNumber) {
            return previous;
          }

          const next = { ...previous };
          delete next.phoneNumber;
          return next;
        });
      }

      handleFieldChange(key)(event);
    };

  const handleSearch = () => {
    const patch = commitDrafts();
    const errors = getPhoneNumberSearchFieldErrors(patch.phoneNumber ?? '');
    setSearchFieldErrors(errors);

    // 무효 필드가 있으면 URL·API에 반영하지 않는다.
    if (hasEstimateRequestSearchFieldErrors(errors)) {
      return;
    }

    updateFilters(patch, { resetPage: true });
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { status: parseMemberStatusFilter(event.target.value) },
      { resetPage: true }
    );
  };

  // 정렬이 바뀌면 1페이지부터 다시 봐야 이전 페이지의 오래된 결과가 남지 않는다.
  const handleSortToggle = useCallback(() => {
    updateFilters(
      { sort: filters.sort === 'DESC' ? 'ASC' : 'DESC' },
      { resetPage: true }
    );
  }, [filters.sort, updateFilters]);

  const columns = useMemo(
    () =>
      getColumns({
        page: filters.page,
        pageSize: filters.pageSize,
        totalCount,
        sort: filters.sort,
        onSortToggle: handleSortToggle,
      }),
    [
      getColumns,
      filters.page,
      filters.pageSize,
      filters.sort,
      handleSortToggle,
      totalCount,
    ]
  );

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

    const startDate = toAdminMemberApiDate(range.from);
    // 종료일이 없으면 BE 정책대로 startDate 당일만 조회되도록 endDate를 생략한다.
    const endDate = range.to ? toAdminMemberApiDate(range.to) : undefined;

    updateFilters({ startDate, endDate }, { resetPage: true });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    clearDrafts();
    setSearchFieldErrors({});
    updateFilters({
      ...INITIAL_ADMIN_MEMBER_LIST_FILTERS,
      userName: undefined,
      email: undefined,
      phoneNumber: undefined,
      status: undefined,
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasActiveFilters = Boolean(
    filters.userName ||
    filters.email ||
    filters.phoneNumber ||
    filters.status ||
    filters.startDate ||
    filters.endDate
  );

  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={errorTitle}
          description={t('members.common.retry')}
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title={
            hasActiveFilters ? t('members.list.noResults') : emptyNoDataTitle
          }
          description={
            hasActiveFilters ? t('members.list.changeFilters') : undefined
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                {t('members.list.resetFilters')}
              </Button>
            ) : undefined
          }
        />
      );
    }

    return (
      <DataTable columns={columns} data={items} rowKey="id" caption={caption} />
    );
  };

  return (
    <AdminListLayout
      title={title}
      description={description}
      page={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      filters={
        <>
          <MultiFieldSearch
            fields={[
              {
                name: 'userName',
                value: drafts.userName,
                placeholder: t('members.filter.userName'),
                'aria-label': t('members.filter.userName'),
                onChange: handleSearchFieldChange('userName'),
              },
              {
                name: 'email',
                value: drafts.email,
                placeholder: t('members.fields.email'),
                'aria-label': t('members.fields.email'),
                onChange: handleSearchFieldChange('email'),
              },
              {
                name: 'phoneNumber',
                value: drafts.phoneNumber,
                placeholder: t('members.fields.phone'),
                'aria-label': t('members.fields.phone'),
                errorMessage: searchFieldErrors.phoneNumber
                  ? t('members.filter.phoneNumberInvalid')
                  : undefined,
                onChange: handleSearchFieldChange('phoneNumber'),
              },
            ]}
            onSearch={handleSearch}
          />
          <FilterSelect
            aria-label={t('members.list.statusLabel')}
            value={filters.status ?? ''}
            onChange={handleStatusChange}
            options={[
              { label: t('members.status.all'), value: '' },
              { label: t('members.status.active'), value: 'ACTIVE' },
              { label: t('members.status.suspended'), value: 'SUSPENDED' },
            ]}
          />
          <DateRangePopover
            value={dateRangeValue}
            onConfirm={handleDateRangeConfirm}
            placeholder={t('members.list.allJoinDates')}
          />
          <SearchResetButton
            label={t('common.searchReset')}
            onClick={handleResetFilters}
          />
        </>
      }
    >
      {renderListBody()}
    </AdminListLayout>
  );
};
