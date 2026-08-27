import { format } from 'date-fns';

import { formatLocalizedDateTime } from './formatLocalizedDate.ts';

import type {
  AdminReviewDetailQuery,
  AdminReviewListQuery,
  AdminReviewStatisticsQuery,
  AdminReviewUserSummary,
} from '@/types/adminReview';
import type { AdminReviewUrlFilters } from '@/utils/adminListSearchParams';

/** API 쿼리용 YYYY-MM-DD */
export const toAdminReviewApiDate = (date: Date) => format(date, 'yyyy-MM-dd');

/** 목록·상세 작성일 표시 — 회원/신고 목록과 동일한 포맷 */
export const formatAdminReviewCreatedAt = (iso: string, locale: string) =>
  formatLocalizedDateTime(iso, locale);

/**
 * 작성자·기사 셀 메인 라벨.
 * 신고자 표시와 같이 이름을 우선하고, 닉네임이 다르면 괄호로 보조한다.
 */
export const formatAdminReviewUserLabel = (
  user: Pick<AdminReviewUserSummary, 'name' | 'nickname'>
) => {
  if (user.nickname && user.nickname !== user.name) {
    return `${user.name} (${user.nickname})`;
  }

  return user.name;
};

/**
 * 목록 작성일 필터 → 통계 query.
 * startDate가 없으면 전체 기간(undefined)을 넘긴다.
 */
export const toAdminReviewStatisticsQuery = (
  startDate?: string,
  endDate?: string
): AdminReviewStatisticsQuery | undefined => {
  if (!startDate) {
    return undefined;
  }

  return {
    startDate,
    ...(endDate ? { endDate } : {}),
  };
};

/**
 * UI 필터 → 목록 API query.
 * undefined·빈 값은 객체에 넣지 않아 axios query string에서 빠진다.
 */
export const buildAdminReviewListQuery = (
  filters: AdminReviewUrlFilters
): AdminReviewListQuery => ({
  page: filters.page,
  pageSize: filters.pageSize,
  sort: filters.sort,
  ...(filters.id ? { id: filters.id } : {}),
  ...(filters.userName ? { userName: filters.userName } : {}),
  ...(filters.moverName ? { moverName: filters.moverName } : {}),
  ...(filters.rating !== undefined ? { rating: filters.rating } : {}),
  ...(filters.deletionStatus ? { deletionStatus: filters.deletionStatus } : {}),
  ...(filters.startDate ? { startDate: filters.startDate } : {}),
  ...(filters.startDate && filters.endDate ? { endDate: filters.endDate } : {}),
});

/**
 * 목록 query → 상세 앞뒤 조회 query.
 * page/pageSize는 빼고 검색·필터·정렬만 남긴다.
 */
export const toAdminReviewDetailQuery = ({
  id,
  userName,
  moverName,
  rating,
  deletionStatus,
  startDate,
  endDate,
  sort,
}: AdminReviewListQuery): AdminReviewDetailQuery => ({
  ...(id ? { id } : {}),
  ...(userName ? { userName } : {}),
  ...(moverName ? { moverName } : {}),
  ...(rating !== undefined ? { rating } : {}),
  ...(deletionStatus ? { deletionStatus } : {}),
  ...(startDate ? { startDate } : {}),
  ...(startDate && endDate ? { endDate } : {}),
  ...(sort ? { sort } : {}),
});
