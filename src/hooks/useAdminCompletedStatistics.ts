import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { ADMIN_COMPLETED_QUERY_KEYS } from '@/constants/adminCompletedQueryKeys';
import { getAdminCompletedStatistics } from '@/services/adminCompletedApi';
import type { AdminCompletedStatisticsQuery } from '@/types/adminCompleted';

export const useAdminCompletedStatistics = (
  params?: AdminCompletedStatisticsQuery
) =>
  useQuery({
    queryKey: ADMIN_COMPLETED_QUERY_KEYS.statistics(params),
    queryFn: () => getAdminCompletedStatistics(params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
