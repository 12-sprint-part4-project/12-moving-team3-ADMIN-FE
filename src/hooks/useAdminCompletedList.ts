import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { ADMIN_COMPLETED_QUERY_KEYS } from '@/constants/adminCompletedQueryKeys';
import { getAdminCompletedList } from '@/services/adminCompletedApi';

import type { AdminCompletedListQuery } from '@/types/adminCompleted';

export const useAdminCompletedList = (params: AdminCompletedListQuery) =>
  useQuery({
    queryKey: ADMIN_COMPLETED_QUERY_KEYS.list(params),
    queryFn: () => getAdminCompletedList(params),
    placeholderData: keepPreviousData,
    retry: false,
  });
