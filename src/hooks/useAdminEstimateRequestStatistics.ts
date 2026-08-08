import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { ADMIN_ESTIMATE_REQUEST_QUERY_KEYS } from '@/constants/adminEstimateRequestQueryKeys';
import { getAdminEstimateRequestStatistics } from '@/services/adminEstimateRequestApi';
import type { AdminEstimateRequestStatisticsQuery } from '@/types/adminEstimateRequest';

export const useAdminEstimateRequestStatistics = (
  params?: AdminEstimateRequestStatisticsQuery
) =>
  useQuery({
    queryKey: ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.statistics(params),
    queryFn: () => getAdminEstimateRequestStatistics(params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
