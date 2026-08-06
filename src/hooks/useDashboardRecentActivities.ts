import { useQuery } from '@tanstack/react-query';

import { ADMIN_DASHBOARD_QUERY_KEYS } from '@/constants/adminDashboardQueryKeys';
import { getAdminDashboardRecentActivities } from '@/services/adminDashboardApi';

interface UseDashboardRecentActivitiesOptions {
  /** false면 최근 활동을 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 대시보드 최근 활동 조회.
 * Query Parameter 없이 최근 7일 신고·가입·완료 목록을 조회한다.
 */
export const useDashboardRecentActivities = (
  options?: UseDashboardRecentActivitiesOptions
) =>
  useQuery({
    queryKey: ADMIN_DASHBOARD_QUERY_KEYS.recentActivities(),
    queryFn: getAdminDashboardRecentActivities,
    enabled: options?.enabled ?? true,
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
