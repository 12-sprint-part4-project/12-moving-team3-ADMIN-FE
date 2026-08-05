import {
  ADMIN_DASHBOARD_REQUEST_TRENDS_PATH,
  ADMIN_DASHBOARD_STATISTICS_PATH,
} from '@/api/adminDashboardPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type {
  AdminDashboardRequestTrendQuery,
  AdminDashboardRequestTrendResponse,
  AdminDashboardStatisticsQuery,
  AdminDashboardStatisticsResponse,
} from '@/types/adminDashboard';

/**
 * 관리자 대시보드 핵심 지표 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * startDate·endDate가 모두 없으면 params를 전달하지 않는다.
 */
export const getAdminDashboardStatistics = async (
  params?: AdminDashboardStatisticsQuery
): Promise<AdminDashboardStatisticsResponse> => {
  const response = await axiosInstance.get<AdminDashboardStatisticsResponse>(
    ADMIN_DASHBOARD_STATISTICS_PATH,
    params ? { params } : undefined
  );

  return response.data;
};

/**
 * 관리자 대시보드 견적 요청 추이 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * period(DAY | WEEK | MONTH)는 필수 Query Parameter다.
 */
export const getAdminDashboardRequestTrend = async (
  params: AdminDashboardRequestTrendQuery
): Promise<AdminDashboardRequestTrendResponse> => {
  const response = await axiosInstance.get<AdminDashboardRequestTrendResponse>(
    ADMIN_DASHBOARD_REQUEST_TRENDS_PATH,
    { params }
  );

  return response.data;
};
