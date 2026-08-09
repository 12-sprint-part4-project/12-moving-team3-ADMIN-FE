import { format } from 'date-fns';

import type {
  AdminReviewStatisticsQuery,
  AdminReviewUserSummary,
} from '@/types/adminReview';

/** API 쿼리용 YYYY-MM-DD */
export const toAdminReviewApiDate = (date: Date) => format(date, 'yyyy-MM-dd');

/** 목록·상세 작성일 표시 — 회원/신고 목록과 동일한 포맷 */
export const formatAdminReviewCreatedAt = (iso: string) => {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  return format(date, 'yyyy-MM-dd HH:mm');
};

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
