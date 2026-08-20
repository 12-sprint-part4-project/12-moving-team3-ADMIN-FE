import type { AdminChatRoomType } from '@/types/adminChat';
import type { AdminReportStatus, AdminReportTarget } from '@/types/adminReport';
import type { AdminReviewDeletionStatus } from '@/types/adminReview';

export const DEFAULT_ADMIN_LIST_PAGE_SIZE = 10;

export const parseAdminListPage = (value: string | null) => {
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;

  const page = Number(value);
  return Number.isSafeInteger(page) ? page : 1;
};

export const parseAdminListDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : undefined;
};

export const parseAdminListEnum = <T extends string>(
  value: string | null,
  allowedValues: readonly T[]
) => allowedValues.find((allowedValue) => allowedValue === value);

export const createAdminListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  managedKeys: readonly string[],
  values: Readonly<Record<string, string | undefined>>
) => {
  const nextSearchParams = new URLSearchParams(searchParams.toString());
  managedKeys.forEach((key) => nextSearchParams.delete(key));
  Object.entries(values).forEach(([key, value]) => {
    if (value) nextSearchParams.set(key, value);
  });

  const queryString = nextSearchParams.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

export interface AdminChatUrlFilters {
  search?: string;
  roomType?: AdminChatRoomType;
  page: number;
  pageSize: number;
}

const CHAT_QUERY_KEYS = ['search', 'roomType', 'page'] as const;
const CHAT_ROOM_TYPES: readonly AdminChatRoomType[] = [
  'GENERAL',
  'DESIGNATED',
  'COMMUNITY',
];

export const parseAdminChatSearchParams = (
  searchParams: URLSearchParams
): AdminChatUrlFilters => {
  const roomType = parseAdminListEnum(
    searchParams.get('roomType'),
    CHAT_ROOM_TYPES
  );
  const search = searchParams.get('search')?.trim() || undefined;

  return {
    ...(search ? { search } : {}),
    ...(roomType ? { roomType } : {}),
    page: parseAdminListPage(searchParams.get('page')),
    pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
  };
};

export const createAdminChatListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: AdminChatUrlFilters
) =>
  createAdminListHref(pathname, searchParams, CHAT_QUERY_KEYS, {
    search: filters.search,
    roomType: filters.roomType,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });

export interface AdminReviewUrlFilters {
  search?: string;
  rating?: number;
  deletionStatus?: AdminReviewDeletionStatus;
  startDate?: string;
  endDate?: string;
  page: number;
  pageSize: number;
}

const REVIEW_QUERY_KEYS = [
  'search',
  'rating',
  'deletionStatus',
  'startDate',
  'endDate',
  'page',
] as const;
const REVIEW_DELETION_STATUSES: readonly AdminReviewDeletionStatus[] = [
  'ACTIVE',
  'DELETED',
];

export const parseAdminReviewSearchParams = (
  searchParams: URLSearchParams
): AdminReviewUrlFilters => {
  const search = searchParams.get('search')?.trim() || undefined;
  const ratingValue = searchParams.get('rating');
  const rating = /^[1-5]$/.test(ratingValue ?? '')
    ? Number(ratingValue)
    : undefined;
  const deletionStatus = parseAdminListEnum(
    searchParams.get('deletionStatus'),
    REVIEW_DELETION_STATUSES
  );
  const startDate = parseAdminListDate(searchParams.get('startDate'));
  const parsedEndDate = parseAdminListDate(searchParams.get('endDate'));
  const endDate =
    startDate && parsedEndDate && parsedEndDate >= startDate
      ? parsedEndDate
      : undefined;

  return {
    ...(search ? { search } : {}),
    ...(rating ? { rating } : {}),
    ...(deletionStatus ? { deletionStatus } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    page: parseAdminListPage(searchParams.get('page')),
    pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
  };
};

export const createAdminReviewListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: AdminReviewUrlFilters
) =>
  createAdminListHref(pathname, searchParams, REVIEW_QUERY_KEYS, {
    search: filters.search,
    rating: filters.rating ? String(filters.rating) : undefined,
    deletionStatus: filters.deletionStatus,
    startDate: filters.startDate,
    endDate: filters.endDate,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });

export interface AdminReportUrlFilters {
  status?: AdminReportStatus;
  target?: AdminReportTarget;
  targetUserKeyword?: string;
  reportedFrom?: string;
  reportedTo?: string;
  page: number;
  pageSize: number;
}

const REPORT_QUERY_KEYS = [
  'status',
  'target',
  'targetUserKeyword',
  'reportedFrom',
  'reportedTo',
  'page',
] as const;

const REPORT_STATUSES: readonly AdminReportStatus[] = [
  'PENDING',
  'RESOLVED',
  'REJECTED',
];
const REPORT_TARGETS: readonly AdminReportTarget[] = [
  'USER',
  'REVIEW',
  'CHAT_ROOM',
  'MESSAGE',
  'ARTICLE',
  'COMMENT',
];

export const parseAdminReportSearchParams = (
  searchParams: URLSearchParams
): AdminReportUrlFilters => {
  const status = parseAdminListEnum(
    searchParams.get('status'),
    REPORT_STATUSES
  );
  const target = parseAdminListEnum(searchParams.get('target'), REPORT_TARGETS);
  const targetUserKeyword =
    searchParams.get('targetUserKeyword')?.trim() || undefined;
  const reportedFrom = parseAdminListDate(searchParams.get('reportedFrom'));
  const parsedReportedTo = parseAdminListDate(searchParams.get('reportedTo'));
  const reportedTo =
    reportedFrom && parsedReportedTo && parsedReportedTo >= reportedFrom
      ? parsedReportedTo
      : undefined;

  return {
    ...(status ? { status } : {}),
    ...(target ? { target } : {}),
    ...(targetUserKeyword ? { targetUserKeyword } : {}),
    ...(reportedFrom ? { reportedFrom } : {}),
    ...(reportedTo ? { reportedTo } : {}),
    page: parseAdminListPage(searchParams.get('page')),
    pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
  };
};

export const createAdminReportListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: AdminReportUrlFilters
) =>
  createAdminListHref(pathname, searchParams, REPORT_QUERY_KEYS, {
    status: filters.status,
    target: filters.target,
    targetUserKeyword: filters.targetUserKeyword,
    reportedFrom: filters.reportedFrom,
    reportedTo: filters.reportedTo,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });
