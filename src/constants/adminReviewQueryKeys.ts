import type {
  AdminReviewListQuery,
  AdminReviewStatisticsQuery,
} from '@/types/adminReview';

/**
 * 관리자 리뷰 조회용 queryKey.
 * params가 바뀌면 queryKey가 달라져 필터·기간별 캐시가 분리된다.
 */
export const ADMIN_REVIEW_QUERY_KEYS = {
  all: ['adminReviews'] as const,
  lists: () => [...ADMIN_REVIEW_QUERY_KEYS.all, 'list'] as const,
  list: (params?: AdminReviewListQuery) =>
    [...ADMIN_REVIEW_QUERY_KEYS.lists(), params] as const,
  statistics: (params?: AdminReviewStatisticsQuery) =>
    [...ADMIN_REVIEW_QUERY_KEYS.all, 'statistics', params] as const,
};
