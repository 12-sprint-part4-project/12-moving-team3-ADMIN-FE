import {
  ADMIN_REVIEW_LIST_PATH,
  ADMIN_REVIEW_STATISTICS_PATH,
  getAdminReviewPath,
} from '@/api/adminReviewPaths';
import { axiosInstance } from '@/api/axiosInstance';

import type {
  AdminReviewListQuery,
  AdminReviewListResponse,
  AdminReviewStatisticsQuery,
  AdminReviewStatisticsResponse,
} from '@/types/adminReview';

/**
 * 관리자 리뷰 목록 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * id·userName·moverName·rating은 값이 있을 때만 params에 포함한다(axios가 undefined를 제외한다).
 */
export const getAdminReviewList = async (
  params?: AdminReviewListQuery
): Promise<AdminReviewListResponse> => {
  const response = await axiosInstance.get<AdminReviewListResponse>(
    ADMIN_REVIEW_LIST_PATH,
    { params }
  );

  return response.data;
};

/**
 * 관리자 리뷰 soft delete.
 * 성공 시 204 No Content라 본문이 없다.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const deleteAdminReview = async (reviewId: number): Promise<void> => {
  await axiosInstance.delete(getAdminReviewPath(reviewId));
};

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
