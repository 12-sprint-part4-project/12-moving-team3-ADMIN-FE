import {
  ADMIN_ESTIMATE_REQUEST_LIST_PATHS,
  ADMIN_ESTIMATE_REQUEST_STATISTICS_PATHS,
  getAdminEstimateRequestDetailPath,
} from '@/api/adminEstimateRequestPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type {
  AdminEstimateRequestDetailResponse,
  AdminEstimateRequestListQuery,
  AdminEstimateRequestListResponse,
  AdminEstimateRequestStatisticsQuery,
  AdminEstimateRequestStatisticsResponse,
} from '@/types/adminEstimateRequest';

export const getAdminEstimateRequestList = async (
  params: AdminEstimateRequestListQuery
): Promise<AdminEstimateRequestListResponse> => {
  const response = await axiosInstance.get<AdminEstimateRequestListResponse>(
    ADMIN_ESTIMATE_REQUEST_LIST_PATHS,
    { params }
  );

  return response.data;
};

export const getAdminEstimateRequestStatistics = async (
  params?: AdminEstimateRequestStatisticsQuery
): Promise<AdminEstimateRequestStatisticsResponse> => {
  const response =
    await axiosInstance.get<AdminEstimateRequestStatisticsResponse>(
      ADMIN_ESTIMATE_REQUEST_STATISTICS_PATHS,
      params ? { params } : undefined
    );

  return response.data;
};

/**
 * 관리자 견적 요청 상세 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminEstimateRequestDetail = async (
  estimateRequestId: number
): Promise<AdminEstimateRequestDetailResponse> => {
  const response = await axiosInstance.get<AdminEstimateRequestDetailResponse>(
    getAdminEstimateRequestDetailPath(estimateRequestId)
  );

  return response.data;
};
