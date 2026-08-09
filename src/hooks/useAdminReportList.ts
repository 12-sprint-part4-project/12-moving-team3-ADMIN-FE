import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { ADMIN_REPORT_QUERY_KEYS } from '@/constants/adminReportQueryKeys';
import { getAdminReportList } from '@/services/adminReportApi';
import type { AdminReportListQuery } from '@/types/adminReport';

interface UseAdminReportListOptions {
  /** false면 목록을 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 신고 목록 조회.
 * params가 바뀌면 queryKey가 달라져 필터별 캐시가 분리된다.
 * keepPreviousData로 page/search/filter 변경 중에도 이전 목록을 유지한다.
 * (전역 QueryProvider도 retry: false이지만, useAdminMemberList와 동일하게 명시한다.)
 */
export const useAdminReportList = (
  params?: AdminReportListQuery,
  options?: UseAdminReportListOptions
) =>
  useQuery({
    queryKey: ADMIN_REPORT_QUERY_KEYS.list(params),
    queryFn: () => getAdminReportList(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    retry: false,
  });
