import {
  isValidSearchId,
  isValidSearchPhoneNumber,
} from './adminSearchFieldValidation.ts';

import type { AdminChatRoomType } from '@/types/adminChat';
import type {
  AdminEstimateRequestMoveType,
  AdminEstimateRequestStatus,
  AdminListSortDirection,
} from '@/types/adminEstimateRequest';
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

/**
 * 시작·종료일을 검증한다.
 * 시작일이 없거나 종료일이 시작일보다 이르면 endDate는 버린다.
 */
export const parseAdminListDateRange = (
  startValue: string | null,
  endValue: string | null
): { startDate?: string; endDate?: string } => {
  const startDate = parseAdminListDate(startValue);
  if (!startDate) {
    return {};
  }

  const parsedEndDate = parseAdminListDate(endValue);
  const endDate =
    parsedEndDate && parsedEndDate >= startDate ? parsedEndDate : undefined;

  return {
    startDate,
    ...(endDate ? { endDate } : {}),
  };
};

export const parseAdminListEnum = <T extends string>(
  value: string | null,
  allowedValues: readonly T[]
) => allowedValues.find((allowedValue) => allowedValue === value);

/** 잘못된 정렬값은 기본값 DESC로 처리한다. */
const parseAdminListSort = (value: string | null): AdminListSortDirection =>
  value === 'ASC' ? 'ASC' : 'DESC';

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
  id?: string;
  userName?: string;
  roomType?: AdminChatRoomType;
  page: number;
  pageSize: number;
}

const CHAT_QUERY_KEYS = ['id', 'userName', 'roomType', 'page'] as const;
const CHAT_ROOM_TYPES: readonly AdminChatRoomType[] = [
  'GENERAL',
  'DESIGNATED',
  'COMMUNITY',
];

export const parseAdminChatSearchParams = (
  searchParams: URLSearchParams
): AdminChatUrlFilters => {
  const rawId = searchParams.get('id')?.trim() || undefined;
  const userName = searchParams.get('userName')?.trim() || undefined;
  const roomType = parseAdminListEnum(
    searchParams.get('roomType'),
    CHAT_ROOM_TYPES
  );
  // URL 직접 입력 시 무효 값은 필터에서 제외해 API로 보내지 않는다.
  const id = rawId && isValidSearchId(rawId) ? rawId : undefined;

  return {
    ...(id ? { id } : {}),
    ...(userName ? { userName } : {}),
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
    id: filters.id,
    userName: filters.userName,
    roomType: filters.roomType,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });

export interface AdminReviewUrlFilters {
  id?: string;
  userName?: string;
  moverName?: string;
  rating?: number;
  deletionStatus?: AdminReviewDeletionStatus;
  startDate?: string;
  endDate?: string;
  sort: AdminListSortDirection;
  page: number;
  pageSize: number;
}

const REVIEW_QUERY_KEYS = [
  'id',
  'userName',
  'moverName',
  'rating',
  'deletionStatus',
  'startDate',
  'endDate',
  'sort',
  'page',
] as const;
const REVIEW_DELETION_STATUSES: readonly AdminReviewDeletionStatus[] = [
  'ACTIVE',
  'DELETED',
];

export const parseAdminReviewSearchParams = (
  searchParams: URLSearchParams
): AdminReviewUrlFilters => {
  const rawId = searchParams.get('id')?.trim() || undefined;
  const userName = searchParams.get('userName')?.trim() || undefined;
  const moverName = searchParams.get('moverName')?.trim() || undefined;
  const id = rawId && isValidSearchId(rawId) ? rawId : undefined;
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
    ...(id ? { id } : {}),
    ...(userName ? { userName } : {}),
    ...(moverName ? { moverName } : {}),
    ...(rating ? { rating } : {}),
    ...(deletionStatus ? { deletionStatus } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    sort: parseAdminListSort(searchParams.get('sort')),
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
    id: filters.id,
    userName: filters.userName,
    moverName: filters.moverName,
    rating: filters.rating ? String(filters.rating) : undefined,
    deletionStatus: filters.deletionStatus,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort === 'ASC' ? 'ASC' : undefined,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });

export interface AdminReportUrlFilters {
  status?: AdminReportStatus;
  target?: AdminReportTarget;
  id?: string;
  userName?: string;
  reportedFrom?: string;
  reportedTo?: string;
  sort: AdminListSortDirection;
  page: number;
  pageSize: number;
}

const REPORT_QUERY_KEYS = [
  'status',
  'target',
  'id',
  'userName',
  'reportedFrom',
  'reportedTo',
  'sort',
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
  const rawId = searchParams.get('id')?.trim() || undefined;
  const userName = searchParams.get('userName')?.trim() || undefined;
  const id = rawId && isValidSearchId(rawId) ? rawId : undefined;
  const reportedFrom = parseAdminListDate(searchParams.get('reportedFrom'));
  const parsedReportedTo = parseAdminListDate(searchParams.get('reportedTo'));
  const reportedTo =
    reportedFrom && parsedReportedTo && parsedReportedTo >= reportedFrom
      ? parsedReportedTo
      : undefined;

  return {
    ...(status ? { status } : {}),
    ...(target ? { target } : {}),
    ...(id ? { id } : {}),
    ...(userName ? { userName } : {}),
    ...(reportedFrom ? { reportedFrom } : {}),
    ...(reportedTo ? { reportedTo } : {}),
    sort: parseAdminListSort(searchParams.get('sort')),
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
    id: filters.id,
    userName: filters.userName,
    reportedFrom: filters.reportedFrom,
    reportedTo: filters.reportedTo,
    sort: filters.sort === 'ASC' ? 'ASC' : undefined,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });

export interface AdminEstimateRequestUrlFilters {
  id?: string;
  userName?: string;
  phoneNumber?: string;
  status?: AdminEstimateRequestStatus;
  startDate?: string;
  endDate?: string;
  sort: AdminListSortDirection;
  page: number;
  pageSize: number;
}

const ESTIMATE_REQUEST_QUERY_KEYS = [
  'id',
  'userName',
  'phoneNumber',
  'status',
  'startDate',
  'endDate',
  'sort',
  'page',
] as const;
export const ESTIMATE_REQUEST_STATUSES: readonly AdminEstimateRequestStatus[] =
  ['SUBMITTED', 'CONFIRMED', 'EXPIRED', 'CANCELED'];

export const parseAdminEstimateRequestSearchParams = (
  searchParams: URLSearchParams
): AdminEstimateRequestUrlFilters => {
  const rawId = searchParams.get('id')?.trim() || undefined;
  const userName = searchParams.get('userName')?.trim() || undefined;
  const rawPhoneNumber = searchParams.get('phoneNumber')?.trim() || undefined;
  // URL 직접 입력 시 무효 값은 필터에서 제외해 API로 보내지 않는다.
  const id = rawId && isValidSearchId(rawId) ? rawId : undefined;
  const phoneNumber =
    rawPhoneNumber && isValidSearchPhoneNumber(rawPhoneNumber)
      ? rawPhoneNumber
      : undefined;
  const status = parseAdminListEnum(
    searchParams.get('status'),
    ESTIMATE_REQUEST_STATUSES
  );
  const { startDate, endDate } = parseAdminListDateRange(
    searchParams.get('startDate'),
    searchParams.get('endDate')
  );

  return {
    ...(id ? { id } : {}),
    ...(userName ? { userName } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(status ? { status } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    sort: parseAdminListSort(searchParams.get('sort')),
    page: parseAdminListPage(searchParams.get('page')),
    pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
  };
};

export const createAdminEstimateRequestListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: AdminEstimateRequestUrlFilters
) =>
  createAdminListHref(pathname, searchParams, ESTIMATE_REQUEST_QUERY_KEYS, {
    id: filters.id,
    userName: filters.userName,
    phoneNumber: filters.phoneNumber,
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort === 'ASC' ? 'ASC' : undefined,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });

export interface AdminCompletedUrlFilters {
  id?: string;
  userName?: string;
  phoneNumber?: string;
  moveType?: AdminEstimateRequestMoveType;
  startDate?: string;
  endDate?: string;
  sort: AdminListSortDirection;
  page: number;
  pageSize: number;
}

const COMPLETED_QUERY_KEYS = [
  'id',
  'userName',
  'phoneNumber',
  'moveType',
  'startDate',
  'endDate',
  'sort',
  'page',
] as const;
export const COMPLETED_MOVE_TYPES: readonly AdminEstimateRequestMoveType[] = [
  'SMALL',
  'HOME',
  'OFFICE',
];

export const parseAdminCompletedSearchParams = (
  searchParams: URLSearchParams
): AdminCompletedUrlFilters => {
  const rawId = searchParams.get('id')?.trim() || undefined;
  const userName = searchParams.get('userName')?.trim() || undefined;
  const rawPhoneNumber = searchParams.get('phoneNumber')?.trim() || undefined;
  // URL 직접 입력 시 무효 값은 필터에서 제외해 API로 보내지 않는다.
  const id = rawId && isValidSearchId(rawId) ? rawId : undefined;
  const phoneNumber =
    rawPhoneNumber && isValidSearchPhoneNumber(rawPhoneNumber)
      ? rawPhoneNumber
      : undefined;
  const moveType = parseAdminListEnum(
    searchParams.get('moveType'),
    COMPLETED_MOVE_TYPES
  );
  const { startDate, endDate } = parseAdminListDateRange(
    searchParams.get('startDate'),
    searchParams.get('endDate')
  );

  return {
    ...(id ? { id } : {}),
    ...(userName ? { userName } : {}),
    ...(phoneNumber ? { phoneNumber } : {}),
    ...(moveType ? { moveType } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    sort: parseAdminListSort(searchParams.get('sort')),
    page: parseAdminListPage(searchParams.get('page')),
    pageSize: DEFAULT_ADMIN_LIST_PAGE_SIZE,
  };
};

export const createAdminCompletedListHref = (
  pathname: string,
  searchParams: URLSearchParams,
  filters: AdminCompletedUrlFilters
) =>
  createAdminListHref(pathname, searchParams, COMPLETED_QUERY_KEYS, {
    id: filters.id,
    userName: filters.userName,
    phoneNumber: filters.phoneNumber,
    moveType: filters.moveType,
    startDate: filters.startDate,
    endDate: filters.endDate,
    sort: filters.sort === 'ASC' ? 'ASC' : undefined,
    page: filters.page > 1 ? String(filters.page) : undefined,
  });
