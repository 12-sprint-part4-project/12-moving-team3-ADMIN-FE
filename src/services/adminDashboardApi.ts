import { ADMIN_DASHBOARD_STATISTICS_PATH } from '@/api/adminDashboardPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type {
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
