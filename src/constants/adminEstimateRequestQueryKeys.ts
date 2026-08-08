import type {
  AdminEstimateRequestListQuery,
  AdminEstimateRequestStatisticsQuery,
} from '@/types/adminEstimateRequest';

export const ADMIN_ESTIMATE_REQUEST_QUERY_KEYS = {
  all: ['adminEstimateRequests'] as const,
  lists: () => [...ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.all, 'list'] as const,
  list: (params: AdminEstimateRequestListQuery) =>
    [...ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.lists(), params] as const,
  statistics: (params?: AdminEstimateRequestStatisticsQuery) =>
    [...ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.all, 'statistics', params] as const,
  details: () => [...ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.all, 'detail'] as const,
  detail: (estimateRequestId: number | null) =>
    [
      ...ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.details(),
      estimateRequestId,
    ] as const,
};
