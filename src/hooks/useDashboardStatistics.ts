import { useQuery } from '@tanstack/react-query';

import { ADMIN_DASHBOARD_QUERY_KEYS } from '@/constants/adminDashboardQueryKeys';
import { getAdminDashboardStatistics } from '@/services/adminDashboardApi';

import type { AdminDashboardStatisticsQuery } from '@/types/adminDashboard';

interface UseDashboardStatisticsOptions {
  /** false면 통계를 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 대시보드 핵심 지표 조회.
 * params가 바뀌면 queryKey가 달라져 기간별 캐시가 분리된다.
 * (전역 QueryProvider도 retry: false이지만, 다른 admin 훅과 동일하게 명시한다.)
 */
export const useDashboardStatistics = (
  params?: AdminDashboardStatisticsQuery,
  options?: UseDashboardStatisticsOptions
) =>
  useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.statistics(params),
    queryFn: () => getAdminDashboardStatistics(params),
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
