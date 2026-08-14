import {
  ADMIN_COMPLETED_LIST_PATH,
  ADMIN_COMPLETED_STATISTICS_PATH,
  getAdminCompletedDetailPath,
} from '@/api/adminCompletedPaths';
import { axiosInstance } from '@/api/axiosInstance';

import type {
  AdminCompletedDetailResponse,
  AdminCompletedListQuery,
  AdminCompletedListResponse,
  AdminCompletedStatisticsQuery,
  AdminCompletedStatisticsResponse,
} from '@/types/adminCompleted';

export const getAdminCompletedList = async (
  params: AdminCompletedListQuery
): Promise<AdminCompletedListResponse> => {
  const response = await axiosInstance.get<AdminCompletedListResponse>(
    ADMIN_COMPLETED_LIST_PATH,
    { params }
  );

  return response.data;
};

export const getAdminCompletedStatistics = async (
  params?: AdminCompletedStatisticsQuery
): Promise<AdminCompletedStatisticsResponse> => {
  const response = await axiosInstance.get<AdminCompletedStatisticsResponse>(
    ADMIN_COMPLETED_STATISTICS_PATH,
    params ? { params } : undefined
  );

  return response.data;
};

/**
 * 관리자 완료 건 상세 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminCompletedDetail = async (
  estimateRequestId: number
): Promise<AdminCompletedDetailResponse> => {
  const response = await axiosInstance.get<AdminCompletedDetailResponse>(
    getAdminCompletedDetailPath(estimateRequestId)
  );

  return response.data;
};
