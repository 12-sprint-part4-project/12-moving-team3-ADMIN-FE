import {
  createAdminListHref,
  DEFAULT_ADMIN_LIST_PAGE_SIZE,
  parseAdminListDate,
  parseAdminListEnum,
  parseAdminListPage,
} from './adminListSearchParams.ts';

import type { AdminMemberSortOrder, MemberStatus } from '@/types/adminMember';

export interface AdminMemberListFilters {
  search?: string;
  status?: MemberStatus;
  startDate?: string;
  endDate?: string;
  sortOrder: AdminMemberSortOrder;
  page: number;
  pageSize: number;
}

export const INITIAL_ADMIN_MEMBER_LIST_FILTERS: AdminMemberListFilters = {
  sortOrder: 'DESC',
  page: 1,
  pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
};

const MANAGED_QUERY_KEYS = [
  'search',
  'page',
  'status',
  'startDate',
  'endDate',
  'sortOrder',
] as const;

const MEMBER_STATUSES: readonly MemberStatus[] = ['ACTIVE', 'SUSPENDED'];

/** URL query를 검증된 회원·기사 목록 상태로 변환한다. */
export const parseAdminMemberListSearchParams = (
  searchParams: URLSearchParams
): AdminMemberListFilters => {
  const search = searchParams.get('search')?.trim() || undefined;
  const status = parseAdminListEnum(
    searchParams.get('status'),
    MEMBER_STATUSES
  );
  const startDate = parseAdminListDate(searchParams.get('startDate'));
  const parsedEndDate = parseAdminListDate(searchParams.get('endDate'));
  const endDate =
    startDate && parsedEndDate && parsedEndDate >= startDate
      ? parsedEndDate
      : undefined;
  const sortOrder = searchParams.get('sortOrder') === 'ASC' ? 'ASC' : 'DESC';

  return {
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    sortOrder,
    page: parseAdminListPage(searchParams.get('page')),
    pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
  };
};

/** 다른 query는 보존하고 목록 query만 현재 상태에 맞게 갱신한다. */
export const createAdminMemberListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: AdminMemberListFilters
) =>
  createAdminListHref(pathname, searchParams, MANAGED_QUERY_KEYS, {
    search: filters.search,
    page: filters.page > 1 ? String(filters.page) : undefined,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sortOrder: filters.sortOrder === 'ASC' ? 'ASC' : undefined,
  });
