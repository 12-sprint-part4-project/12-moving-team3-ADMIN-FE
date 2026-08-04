import type { AdminReportListQuery } from '@/types/adminReport';

/**
 * 관리자 신고 조회용 queryKey.
 * params가 바뀌면 queryKey가 달라져 필터별 캐시가 분리된다.
 */
export const ADMIN_REPORT_QUERY_KEYS = {
  all: ['adminReports'] as const,
  lists: () => [...ADMIN_REPORT_QUERY_KEYS.all, 'list'] as const,
  list: (params?: AdminReportListQuery) =>
    [...ADMIN_REPORT_QUERY_KEYS.lists(), params] as const,
};
