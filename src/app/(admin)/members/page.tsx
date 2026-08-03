'use client';

import { format } from 'date-fns';
import { useMemo, useState, type ChangeEvent } from 'react';

import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import {
  DateRangePopover,
  type DateRangePopoverProps,
} from '@/components/DateRangePopover/DateRangePopover';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { Pagination } from '@/components/Pagination/Pagination';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminMemberList } from '@/hooks/useAdminMemberList';
import type {
  AdminMemberListItem,
  AdminMemberListQuery,
  MemberStatus,
} from '@/types/adminMember';

const DEFAULT_PAGE_SIZE = 10;

/** 상태 필터: 빈 문자열은 status 미전달(전체) */
const STATUS_FILTER_OPTIONS = [
  { label: '상태 전체', value: '' },
  { label: '활성', value: 'ACTIVE' },
  { label: '정지', value: 'SUSPENDED' },
] as const;

type StatusFilterValue = '' | MemberStatus;

interface MemberListFilters {
  search?: string;
  status?: MemberStatus;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: MemberListFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** API 쿼리용 YYYY-MM-DD */
const toApiDate = (date: Date) => format(date, 'yyyy-MM-dd');

/** 목록 가입일 표시 */
const formatJoinedAt = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
};

const toListQuery = (filters: MemberListFilters): AdminMemberListQuery => ({
  userType: 'CUSTOMER',
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.status ? { status: filters.status } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.endDate ? { endDate: filters.endDate } : {}),
});

const MembersPage = () => {
  // 입력창 초안. 검색 버튼/Enter 시에만 실제 조회 Query에 반영한다.
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<MemberListFilters>(INITIAL_FILTERS);

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const { data, isPending, isError } = useAdminMemberList(listQuery);

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.page ?? filters.page;

  const dateRangeValue = useMemo<DateRangePopoverProps['value']>(() => {
    if (!filters.startDate) {
      return undefined;
    }

    const from = new Date(`${filters.startDate}T00:00:00`);
    const to = filters.endDate
      ? new Date(`${filters.endDate}T00:00:00`)
      : from;

    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
      return undefined;
    }

    return { from, to };
  }, [filters.startDate, filters.endDate]);

  const columns = useMemo<Column<AdminMemberListItem>[]>(
    () => [
      {
        key: 'index',
        header: '번호',
        render: (_row, index) =>
          (filters.page - 1) * filters.pageSize + index + 1,
      },
      { key: 'name', header: '이름', accessor: 'name' },
      { key: 'email', header: '이메일', accessor: 'email' },
      {
        key: 'phoneNumber',
        header: '전화번호',
        render: (row) => row.phoneNumber ?? '-',
      },
      {
        key: 'createdAt',
        header: '가입일',
        render: (row) => formatJoinedAt(row.createdAt),
      },
      {
        key: 'status',
        header: '상태',
        align: 'center',
        render: (row) => (
          <StatusBadge
            variant={row.status === 'ACTIVE' ? 'success' : 'danger'}
            label={row.status === 'ACTIVE' ? '활성' : '정지'}
          />
        ),
      },
    ],
    [filters.page, filters.pageSize]
  );

  const updateFilters = (
    patch: Partial<MemberListFilters>,
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
    const value = event.target.value as StatusFilterValue;
    updateFilters(
      { status: value === '' ? undefined : value },
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

    const startDate = toApiDate(range.from);
    // 종료일이 없으면 BE 정책대로 startDate 당일만 조회되도록 endDate를 생략한다.
    const endDate = range.to ? toApiDate(range.to) : undefined;

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

  const renderListBody = () => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="회원 목록을 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title={
            hasActiveFilters
              ? '검색 결과가 없습니다.'
              : '등록된 회원이 없습니다.'
          }
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
      <>
        <DataTable
          columns={columns}
          data={items}
          rowKey="id"
          caption="일반 회원 목록"
        />
        {totalPages > 0 ? (
          <div className="mt-6 flex justify-center">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        ) : null}
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="회원 관리"
        description="일반 회원 목록을 조회하고 검색·필터할 수 있습니다."
      />

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={searchInput}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="이름, 이메일, 휴대폰 검색"
            className="min-w-64 flex-1"
            aria-label="회원 검색"
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
        </div>

        <section className="rounded-lg border border-line-200 bg-white">
          {renderListBody()}
        </section>
      </div>
    </>
  );
};

export default MembersPage;
