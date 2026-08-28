import { useQuery } from '@tanstack/react-query';

import { ADMIN_REPORT_QUERY_KEYS } from '@/constants/adminReportQueryKeys';
import { getAdminReportStatistics } from '@/services/adminReportApi';

import type { AdminReportStatisticsQuery } from '@/types/adminReport';

export const useAdminReportStatistics = (
  params?: AdminReportStatisticsQuery
) =>
  useQuery({
    queryKey: ADMIN_REPORT_QUERY_KEYS.statistics(params),
    queryFn: () => getAdminReportStatistics(params),
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
