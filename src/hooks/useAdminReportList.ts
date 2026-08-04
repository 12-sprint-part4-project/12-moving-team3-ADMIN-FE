import { useQuery } from '@tanstack/react-query';

import { ADMIN_REPORT_QUERY_KEYS } from '@/constants/adminReportQueryKeys';
import { getAdminReportList } from '@/services/adminReportApi';

interface UseAdminReportListOptions {
  /** false면 목록을 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 신고 목록 조회.
 * (전역 QueryProvider도 retry: false이지만, useAdminMemberList와 동일하게 명시한다.)
 */
export const useAdminReportList = (options?: UseAdminReportListOptions) =>
  useQuery({
    queryKey: ADMIN_REPORT_QUERY_KEYS.list(),
    queryFn: () => getAdminReportList(),
    enabled: options?.enabled ?? true,
    retry: false,
  });
