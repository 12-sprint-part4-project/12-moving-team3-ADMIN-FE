import { useQuery } from '@tanstack/react-query';

import { ADMIN_ESTIMATE_REQUEST_QUERY_KEYS } from '@/constants/adminEstimateRequestQueryKeys';
import { getAdminEstimateRequestDetail } from '@/services/adminEstimateRequestApi';

interface UseAdminEstimateRequestDetailOptions {
  /** false면 상세를 호출하지 않는다. estimateRequestId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
}

/**
 * 관리자 견적 요청 상세 조회.
 * estimateRequestId가 없으면 요청하지 않는다(Drawer 미선택 등).
 */
export const useAdminEstimateRequestDetail = (
  estimateRequestId?: number | null,
  options?: UseAdminEstimateRequestDetailOptions
) =>
  useQuery({
    queryKey: ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.detail(estimateRequestId ?? 0),
    queryFn: () => {
      if (estimateRequestId == null) {
        return Promise.reject(new Error('estimateRequestId is required'));
      }

      return getAdminEstimateRequestDetail(estimateRequestId);
    },
    // Drawer가 열려 있고 견적 요청이 선택된 경우에만 호출한다.
    enabled: (options?.enabled ?? true) && estimateRequestId != null,
    retry: false,
  });
