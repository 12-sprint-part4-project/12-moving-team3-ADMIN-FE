import {
  ADMIN_ESTIMATE_REQUEST_LIST_PATHS,
  ADMIN_ESTIMATE_REQUEST_STATISTICS_PATHS,
} from '@/api/adminEstimateRequestPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type {
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
