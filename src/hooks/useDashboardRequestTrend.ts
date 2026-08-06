import { useQuery } from '@tanstack/react-query';

import { ADMIN_DASHBOARD_QUERY_KEYS } from '@/constants/adminDashboardQueryKeys';
import { getAdminDashboardRequestTrend } from '@/services/adminDashboardApi';
import type { AdminDashboardRequestTrendPeriod } from '@/types/adminDashboard';

interface UseDashboardRequestTrendOptions {
  /** false면 추이를 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 대시보드 견적 요청 추이 조회.
 * period가 바뀌면 queryKey가 달라져 기간별 캐시가 분리된다.
 */
export const useDashboardRequestTrend = (
  period: AdminDashboardRequestTrendPeriod,
  options?: UseDashboardRequestTrendOptions
) =>
  useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.requestTrend(period),
    queryFn: () => getAdminDashboardRequestTrend({ period }),
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
