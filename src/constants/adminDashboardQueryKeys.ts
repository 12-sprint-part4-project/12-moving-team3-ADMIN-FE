import type {
  AdminDashboardRequestTrendPeriod,
  AdminDashboardStatisticsQuery,
} from '@/types/adminDashboard';

/**
 * 관리자 대시보드 조회용 queryKey.
 * params가 바뀌면 queryKey가 달라져 기간별 캐시가 분리된다.
 */
export const ADMIN_DASHBOARD_QUERY_KEYS = {
  all: ['adminDashboard'] as const,
  statistics: (params?: AdminDashboardStatisticsQuery) =>
    [...ADMIN_DASHBOARD_QUERY_KEYS.all, 'statistics', params] as const,
  requestTrend: (period: AdminDashboardRequestTrendPeriod) =>
    [...ADMIN_DASHBOARD_QUERY_KEYS.all, 'requestTrend', period] as const,
  requestStatus: () =>
    [...ADMIN_DASHBOARD_QUERY_KEYS.all, 'requestStatus'] as const,
};
