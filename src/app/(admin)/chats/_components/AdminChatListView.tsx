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
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { FilterSelect } from '@/components/FilterSelect/FilterSelect';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { MultiFieldSearch } from '@/components/MultiFieldSearch/MultiFieldSearch';
import { SearchResetButton } from '@/components/SearchResetButton/SearchResetButton';
import { useAdminChatList } from '@/hooks/useAdminChatList';
import { useClampListPage } from '@/hooks/useClampListPage';
import { useDraftSearchFields } from '@/hooks/useDraftSearchFields';
import {
  createAdminChatListHref,
  parseAdminChatSearchParams,
} from '@/utils/adminListSearchParams';
import {
  getSearchIdFieldErrors,
  hasSearchIdFieldErrors,
  type EstimateRequestSearchFieldErrors,
} from '@/utils/adminSearchFieldValidation';
import { navigateSearchHref } from '@/utils/navigateSearchHref';

import type {
  AdminChatListItem,
  AdminChatListQuery,
  AdminChatRoomType,
} from '@/types/adminChat';
import type { AdminChatUrlFilters } from '@/utils/adminListSearchParams';

export type AdminChatListFilters = AdminChatUrlFilters;

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
  ...(filters.id ? { id: filters.id } : {}),
  ...(filters.userName ? { userName: filters.userName } : {}),
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

/**
 * 관리자 채팅방 목록 화면.
 * 검색·유형 필터·페이지네이션과 Loading/Empty/Table 구조를 담당한다.
 */
export const AdminChatListView = ({ getColumns }: AdminChatListViewProps) => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseAdminChatSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  // 검색 버튼/Enter 시에만 URL 검색 필드로 반영한다.
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
  const { data, isPending, isError } = useAdminChatList(listQuery);

  const items = data?.data.items ?? [];
  const pagination = data?.data.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = filters.page;

  const updateFilters = useCallback(
    (
      patch: Partial<AdminChatListFilters>,
      options?: { resetPage?: boolean; replace?: boolean }
    ) => {
      const nextFilters = {
        ...filters,
        ...patch,
        ...(options?.resetPage ? { page: 1 } : {}),
      };
      const href = createAdminChatListHref(
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

  const columns = useMemo(
    () =>
      getColumns({
        page: filters.page,
        pageSize: filters.pageSize,
      }),
    [getColumns, filters.page, filters.pageSize]
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
    clearDrafts();
    setSearchFieldErrors({});
    updateFilters({
      id: undefined,
      userName: undefined,
      roomType: undefined,
      page: 1,
    });
  };

  const hasActiveFilters = Boolean(
    filters.id || filters.userName || filters.roomType
  );
  const roomTypeOptions = ['', 'GENERAL', 'DESIGNATED', 'COMMUNITY'].map(
    (value) => ({
      value,
      label: value ? t(`chats.roomType.${value}`) : t('chats.filter.allTypes'),
    })
  );

  const renderListBody = (): ReactNode => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={t('chats.list.error')}
          description={t('chats.common.retry')}
        />
      );
    }

    if (items.length === 0) {
      return (
        <EmptyState
          title={
            hasActiveFilters ? t('chats.list.noResults') : t('chats.list.empty')
          }
          description={
            hasActiveFilters ? t('chats.list.changeFilters') : undefined
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={handleResetFilters}>
                {t('chats.list.resetFilters')}
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
        caption={t('chats.list.label')}
      />
    );
  };

  return (
    <AdminListLayout
      title={t('chats.title')}
      description={t('chats.description')}
      page={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      filters={
        <>
          <MultiFieldSearch
            fields={[
              {
                name: 'id',
                value: drafts.id,
                placeholder: t('chats.fields.roomId'),
                'aria-label': t('chats.fields.roomId'),
                errorMessage: searchFieldErrors.id
                  ? t('chats.filter.idInvalid')
                  : undefined,
                onChange: handleSearchFieldChange('id'),
              },
              {
                name: 'userName',
                value: drafts.userName,
                placeholder: t('chats.filter.userName'),
                'aria-label': t('chats.filter.userName'),
                onChange: handleSearchFieldChange('userName'),
              },
            ]}
            onSearch={handleSearch}
          />
          <FilterSelect
            aria-label={t('chats.fields.roomType')}
            value={filters.roomType ?? ''}
            onChange={handleRoomTypeChange}
            options={roomTypeOptions}
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
