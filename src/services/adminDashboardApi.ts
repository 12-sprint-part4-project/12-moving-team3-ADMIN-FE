import {
  ADMIN_DASHBOARD_RECENT_ACTIVITY_PATH,
  ADMIN_DASHBOARD_REQUEST_STATUS_PATH,
  ADMIN_DASHBOARD_REQUEST_TRENDS_PATH,
  ADMIN_DASHBOARD_STATISTICS_PATH,
} from '@/api/adminDashboardPaths';
import { axiosInstance } from '@/api/axiosInstance';

import type {
  AdminDashboardRecentActivitiesResponse,
  AdminDashboardRequestStatusResponse,
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

/**
 * 관리자 대시보드 견적 요청 상태 현황 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * Query Parameter 없이 최근 30일 기준 상태별 건수를 반환한다.
 */
export const getAdminDashboardRequestStatus =
  async (): Promise<AdminDashboardRequestStatusResponse> => {
    const response =
      await axiosInstance.get<AdminDashboardRequestStatusResponse>(
        ADMIN_DASHBOARD_REQUEST_STATUS_PATH
      );

    return response.data;
  };

/**
 * 관리자 대시보드 최근 활동 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * Query Parameter 없이 최근 7일 활동 목록을 반환한다.
 */
export const getAdminDashboardRecentActivities =
  async (): Promise<AdminDashboardRecentActivitiesResponse> => {
    const response =
      await axiosInstance.get<AdminDashboardRecentActivitiesResponse>(
        ADMIN_DASHBOARD_RECENT_ACTIVITY_PATH
      );

    return response.data;
  };
