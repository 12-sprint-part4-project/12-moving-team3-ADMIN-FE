'use client';

import { useMemo, useState, type ChangeEvent, type ReactNode } from 'react';

import { AdminListLayout } from '@/components/AdminListLayout/AdminListLayout';
import { Button } from '@/components/Button/Button';
import { DataTable, type Column } from '@/components/DataTable/DataTable';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { useAdminChatList } from '@/hooks/useAdminChatList';
import { useClampListPage } from '@/hooks/useClampListPage';
import { ADMIN_CHAT_ROOM_TYPE_LABEL } from '@/utils/adminChat';

import type {
  AdminChatListItem,
  AdminChatListQuery,
  AdminChatRoomType,
} from '@/types/adminChat';

const DEFAULT_PAGE_SIZE = 10;

/** 채팅방 유형 필터: 빈 문자열은 roomType 미전달(전체) */
const ROOM_TYPE_FILTER_OPTIONS = [
  { label: '전체', value: '' },
  { label: ADMIN_CHAT_ROOM_TYPE_LABEL.GENERAL, value: 'GENERAL' },
  { label: ADMIN_CHAT_ROOM_TYPE_LABEL.DESIGNATED, value: 'DESIGNATED' },
  { label: ADMIN_CHAT_ROOM_TYPE_LABEL.COMMUNITY, value: 'COMMUNITY' },
] as const;

export interface AdminChatListFilters {
  search?: string;
  roomType?: AdminChatRoomType;
  page: number;
  pageSize: number;
}

const INITIAL_FILTERS: AdminChatListFilters = {
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

/** select value → AdminChatRoomType | undefined. 알 수 없는 값은 무시한다. */
const parseRoomTypeFilter = (value: string): AdminChatRoomType | undefined => {
  if (value === 'GENERAL' || value === 'DESIGNATED' || value === 'COMMUNITY') {
    return value;
  }

  return undefined;
};

/**
 * UI 필터 → API query.
 * undefined·빈 값은 객체에 넣지 않아 axios query string에서 빠진다.
 */
const toListQuery = (filters: AdminChatListFilters): AdminChatListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  ...(filters.search ? { search: filters.search } : {}),
  ...(filters.roomType ? { roomType: filters.roomType } : {}),
});

export interface AdminChatListColumnsContext {
  page: number;
  pageSize: number;
}

export interface AdminChatListViewProps {
  getColumns: (
    context: AdminChatListColumnsContext
  ) => Column<AdminChatListItem>[];
}

/** updateFilters 옵션. 검색·필터 변경 시 page 초기화에 사용한다. */
interface UpdateFiltersOptions {
  resetPage?: boolean;
}

/**
 * 관리자 채팅방 목록 화면.
 * 검색·유형 필터·페이지네이션과 Loading/Empty/Table 구조를 담당한다.
 */
export const AdminChatListView = ({ getColumns }: AdminChatListViewProps) => {
  // 입력창 초안. 검색 버튼/Enter 시에만 실제 조회 Query에 반영한다.
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<AdminChatListFilters>(INITIAL_FILTERS);

  const listQuery = useMemo(() => toListQuery(filters), [filters]);
  const { data, isPending, isError } = useAdminChatList(listQuery);

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.page ?? filters.page;

  useClampListPage({
    page: filters.page,
    totalPages: pagination?.totalPages,
    isPending,
    setFilters,
  });

  const columns = useMemo(
    () =>
      getColumns({
        page: filters.page,
        pageSize: filters.pageSize,
      }),
    [getColumns, filters.page, filters.pageSize]
  );

  const updateFilters = (
    patch: Partial<AdminChatListFilters>,
    options?: UpdateFiltersOptions
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

  const handleRoomTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateFilters(
      { roomType: parseRoomTypeFilter(event.target.value) },
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

  const hasActiveFilters = Boolean(filters.search || filters.roomType);

  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="채팅방 목록을 불러오지 못했습니다."
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
              : '등록된 채팅방이 없습니다.'
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
      <DataTable
        columns={columns}
        data={items}
        rowKey="id"
        caption="채팅방 목록"
      />
    );
  };

  return (
    <AdminListLayout
      title="채팅 관리"
      description="채팅방 목록을 조회하고 검색·필터할 수 있습니다."
      page={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      filters={
        <>
          <SearchInput
            value={searchInput}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            placeholder="이름, 닉네임, 이메일, 휴대폰 검색"
            searchAction="button"
            className="min-w-64 flex-1"
            aria-label="채팅방 참여자 검색"
          />
          <FilterSelect
            aria-label="채팅방 유형"
            value={filters.roomType ?? ''}
            onChange={handleRoomTypeChange}
            options={[...ROOM_TYPE_FILTER_OPTIONS]}
          />
        </>
      }
    >
      {renderListBody()}
    </AdminListLayout>
  );
};
