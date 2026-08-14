import { useQuery } from '@tanstack/react-query';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';
import { getAdminReviewStatistics } from '@/services/adminReviewApi';

import type { AdminReviewStatisticsQuery } from '@/types/adminReview';

export const useAdminReviewStatistics = (
  params?: AdminReviewStatisticsQuery
) =>
  useQuery({
    queryKey: ADMIN_REVIEW_QUERY_KEYS.statistics(params),
    queryFn: () => getAdminReviewStatistics(params),
    retry: false,
    staleTime: 1000 * 60 * 3,
  });
