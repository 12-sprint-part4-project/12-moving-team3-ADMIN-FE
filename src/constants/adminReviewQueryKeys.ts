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
  /** 통계 query 전체 무효화용 prefix. lists()와 동일한 역할 */
  statisticses: () => [...ADMIN_REVIEW_QUERY_KEYS.all, 'statistics'] as const,
  statistics: (params?: AdminReviewStatisticsQuery) =>
    [...ADMIN_REVIEW_QUERY_KEYS.statisticses(), params] as const,
};
