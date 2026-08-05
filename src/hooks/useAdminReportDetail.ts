import { useQuery } from '@tanstack/react-query';

import { ADMIN_REPORT_QUERY_KEYS } from '@/constants/adminReportQueryKeys';
import { getAdminReportDetail } from '@/services/adminReportApi';

interface UseAdminReportDetailOptions {
  /** false면 상세를 호출하지 않는다. reportId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
}

/**
 * 관리자 신고 상세 조회.
 * reportId가 없으면 요청하지 않는다(Drawer 미선택 등).
 * (전역 QueryProvider도 retry: false이지만, useAdminMemberDetail과 동일하게 명시한다.)
 */
export const useAdminReportDetail = (
  reportId?: number | null,
  options?: UseAdminReportDetailOptions
) =>
  useQuery({
    queryKey: ADMIN_REPORT_QUERY_KEYS.detail(reportId ?? 0),
    queryFn: () => {
      if (reportId == null) {
        return Promise.reject(new Error('reportId is required'));
      }

      return getAdminReportDetail(reportId);
    },
    // Drawer가 열려 있고 신고가 선택된 경우에만 호출한다.
    enabled: (options?.enabled ?? true) && reportId != null,
    retry: false,
  });
