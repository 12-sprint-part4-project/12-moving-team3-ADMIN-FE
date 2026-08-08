import type { AdminReviewStatisticsQuery } from '@/types/adminReview';

/**
 * 관리자 리뷰 조회용 queryKey.
 * params가 바뀌면 queryKey가 달라져 기간별 캐시가 분리된다.
 */
export const ADMIN_REVIEW_QUERY_KEYS = {
  all: ['adminReviews'] as const,
  statistics: (params?: AdminReviewStatisticsQuery) =>
    [...ADMIN_REVIEW_QUERY_KEYS.all, 'statistics', params] as const,
};
