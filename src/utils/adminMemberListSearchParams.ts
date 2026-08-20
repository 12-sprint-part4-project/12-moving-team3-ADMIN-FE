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

const DEFAULT_PAGE_SIZE = 10;

export const INITIAL_ADMIN_MEMBER_LIST_FILTERS: AdminMemberListFilters = {
  sortOrder: 'DESC',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
};

const MANAGED_QUERY_KEYS = [
  'search',
  'page',
  'status',
  'startDate',
  'endDate',
  'sortOrder',
] as const;

const parsePage = (value: string | null) => {
  if (!value || !/^[1-9]\d*$/.test(value)) {
    return 1;
  }

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
};

const parseDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
};

/** URL query를 검증된 회원·기사 목록 상태로 변환한다. */
export const parseAdminMemberListSearchParams = (
  searchParams: URLSearchParams
): AdminMemberListFilters => {
  const search = searchParams.get('search')?.trim() || undefined;
  const statusValue = searchParams.get('status');
  const status =
    statusValue === 'ACTIVE' || statusValue === 'SUSPENDED'
      ? statusValue
      : undefined;
  const startDate = parseDate(searchParams.get('startDate'));
  const parsedEndDate = parseDate(searchParams.get('endDate'));
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
    page: parsePage(searchParams.get('page')),
    pageSize: DEFAULT_PAGE_SIZE,
  };
};

/** 다른 query는 보존하고 목록 query만 현재 상태에 맞게 갱신한다. */
export const createAdminMemberListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: AdminMemberListFilters
) => {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  MANAGED_QUERY_KEYS.forEach((key) => nextSearchParams.delete(key));

  if (filters.search) nextSearchParams.set('search', filters.search);
  if (filters.page > 1) nextSearchParams.set('page', String(filters.page));
  if (filters.status) nextSearchParams.set('status', filters.status);
  if (filters.startDate) nextSearchParams.set('startDate', filters.startDate);
  if (filters.endDate) nextSearchParams.set('endDate', filters.endDate);
  if (filters.sortOrder === 'ASC') nextSearchParams.set('sortOrder', 'ASC');

  const queryString = nextSearchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};
