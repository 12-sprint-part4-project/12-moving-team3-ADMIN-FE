import { ADMIN_REVIEW_STATISTICS_PATH } from '@/api/adminReviewPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type {
  AdminReviewStatisticsQuery,
  AdminReviewStatisticsResponse,
} from '@/types/adminReview';

/**
 * 관리자 리뷰 통계 조회.
 * params가 없으면 전체 기간을 집계한다.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminReviewStatistics = async (
  params?: AdminReviewStatisticsQuery
): Promise<AdminReviewStatisticsResponse> => {
  const response = await axiosInstance.get<AdminReviewStatisticsResponse>(
    ADMIN_REVIEW_STATISTICS_PATH,
    params ? { params } : undefined
  );

  return response.data;
};
