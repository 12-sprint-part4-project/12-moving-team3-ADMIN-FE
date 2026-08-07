import { useQuery } from '@tanstack/react-query';

import { ADMIN_ESTIMATE_REQUEST_QUERY_KEYS } from '@/constants/adminEstimateRequestQueryKeys';
import { getAdminEstimateRequestList } from '@/services/adminEstimateRequestApi';
import type { AdminEstimateRequestListQuery } from '@/types/adminEstimateRequest';

export const useAdminEstimateRequestList = (
  params: AdminEstimateRequestListQuery
) =>
  useQuery({
    queryKey: ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.list(params),
    queryFn: () => getAdminEstimateRequestList(params),
    retry: false,
  });
