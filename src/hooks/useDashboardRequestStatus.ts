import { useQuery } from '@tanstack/react-query';

import { ADMIN_DASHBOARD_QUERY_KEYS } from '@/constants/adminDashboardQueryKeys';
import { getAdminDashboardRequestStatus } from '@/services/adminDashboardApi';

interface UseDashboardRequestStatusOptions {
  /** false면 상태 현황을 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 대시보드 견적 요청 상태 현황 조회.
 * Query Parameter 없이 최근 30일 기준 상태별 건수를 조회한다.
 */
export const useDashboardRequestStatus = (
  options?: UseDashboardRequestStatusOptions
) =>
  useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.requestStatus(),
    queryFn: getAdminDashboardRequestStatus,
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
