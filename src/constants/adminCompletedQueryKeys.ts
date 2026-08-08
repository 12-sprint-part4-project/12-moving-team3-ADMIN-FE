import type {
  AdminCompletedListQuery,
  AdminCompletedStatisticsQuery,
} from '@/types/adminCompleted';

export const ADMIN_COMPLETED_QUERY_KEYS = {
  all: ['adminCompleted'] as const,
  lists: () => [...ADMIN_COMPLETED_QUERY_KEYS.all, 'list'] as const,
  list: (params: AdminCompletedListQuery) =>
    [...ADMIN_COMPLETED_QUERY_KEYS.lists(), params] as const,
  statistics: (params?: AdminCompletedStatisticsQuery) =>
    [...ADMIN_COMPLETED_QUERY_KEYS.all, 'statistics', params] as const,
  details: () => [...ADMIN_COMPLETED_QUERY_KEYS.all, 'detail'] as const,
  detail: (estimateRequestId: number) =>
    [...ADMIN_COMPLETED_QUERY_KEYS.details(), estimateRequestId] as const,
};
