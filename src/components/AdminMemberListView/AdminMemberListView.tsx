'use client';

import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';

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
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { useAdminMemberList } from '@/hooks/useAdminMemberList';
import { useClampListPage } from '@/hooks/useClampListPage';
import { toAdminMemberApiDate } from '@/utils/adminMember';

import type {
  AdminMemberListItem,
  AdminMemberListQuery,
  AdminMemberSortOrder,
  MemberStatus,
  MemberUserType,
} from '@/types/adminMember';

const DEFAULT_PAGE_SIZE = 10;

/** 상태 필터: 빈 문자열은 status 미전달(전체) */
const STATUS_FILTER_OPTIONS = [
  { label: '상태 전체', value: '' },
  { label: '활성', value: 'ACTIVE' },
  { label: '정지', value: 'SUSPENDED' },
] as const;

const SORT_ORDER_OPTIONS = [
  { label: '가입일 최신순', value: 'DESC' },
  { label: '가입일 오래된순', value: 'ASC' },
] as const;

export interface AdminMemberListFilters {
  search?: string;
  status?: MemberStatus;
  startDate?: string;
  endDate?: string;
  sortOrder: AdminMemberSortOrder;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: AdminMemberListFilters = {
  sortOrder: 'DESC',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** select value → MemberStatus | undefined. 알 수 없는 값은 무시한다. */
const parseMemberStatusFilter = (value: string): MemberStatus | undefined => {
  if (value === 'ACTIVE' || value === 'SUSPENDED') {
    return value;
  }

  return undefined;
};

const parseSortOrder = (value: string): AdminMemberSortOrder =>
  value === 'ASC' ? 'ASC' : 'DESC';

const toListQuery = (
  userType: MemberUserType,
  filters: AdminMemberListFilters
): AdminMemberListQuery => ({
  userType,
  page: filters.page,
  pageSize: filters.pageSize,
  sortOrder: filters.sortOrder,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.endDate ? { endDate: filters.endDate } : {}),
});

export interface AdminMemberListColumnsContext {
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface AdminMemberListViewProps {
  userType: MemberUserType;
  title: string;
  description: string;
  caption: string;
  searchAriaLabel: string;
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
  searchAriaLabel,
  emptyNoDataTitle,
  errorTitle,
  getColumns,
}: AdminMemberListViewProps) => {
  // 입력창 초안. 검색 버튼/Enter 시에만 실제 조회 Query에 반영한다.
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] =
    useState<AdminMemberListFilters>(INITIAL_FILTERS);

  const listQuery = useMemo(
    () => toListQuery(userType, filters),
    [userType, filters]
  );
  const { data, isPending, isError } = useAdminMemberList(listQuery);

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalCount = pagination?.totalCount ?? 0;
  const currentPage = pagination?.page ?? filters.page;

  useClampListPage({
    page: filters.page,
    totalPages: pagination?.totalPages,
    isPending,
    setFilters,
  });

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

  const columns = useMemo(
    () =>
      getColumns({
        page: filters.page,
        pageSize: filters.pageSize,
        totalCount,
      }),
    [getColumns, filters.page, filters.pageSize, totalCount]
  );

  const updateFilters = (
    patch: Partial<AdminMemberListFilters>,
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

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { status: parseMemberStatusFilter(event.target.value) },
      { resetPage: true }
    );
  };

  const handleSortOrderChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { sortOrder: parseSortOrder(event.target.value) },
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

    const startDate = toAdminMemberApiDate(range.from);
    // 종료일이 없으면 BE 정책대로 startDate 당일만 조회되도록 endDate를 생략한다.
    const endDate = range.to ? toAdminMemberApiDate(range.to) : undefined;

    updateFilters({ startDate, endDate }, { resetPage: true });
  };

  const handlePageChange = (page: number) => {
    updateFilters({ page });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters(INITIAL_FILTERS);
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.startDate || filters.endDate
  );

  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={errorTitle}
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title={hasActiveFilters ? '검색 결과가 없습니다.' : emptyNoDataTitle}
          description={
            hasActiveFilters
              ? '검색 조건을 변경한 후 다시 시도해 주세요.'
              : undefined
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                필터 초기화
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
          <SearchInput
            value={searchInput}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="이름, 이메일, 휴대폰 검색"
            className="min-w-64 flex-1"
            aria-label={searchAriaLabel}
          />
          <FilterSelect
            aria-label="상태"
            value={filters.status ?? ''}
            onChange={handleStatusChange}
            options={[...STATUS_FILTER_OPTIONS]}
          />
          <DateRangePopover
            value={dateRangeValue}
            onConfirm={handleDateRangeConfirm}
            placeholder="가입일 전체"
          />
          <FilterSelect
            aria-label="가입일 정렬"
            value={filters.sortOrder}
            onChange={handleSortOrderChange}
            options={[...SORT_ORDER_OPTIONS]}
          />
        </>
      }
    >
      {renderListBody()}
    </AdminListLayout>
  );
};
