import { useQuery } from '@tanstack/react-query';

import { ADMIN_ESTIMATE_REQUEST_QUERY_KEYS } from '@/constants/adminEstimateRequestQueryKeys';
import { getAdminEstimateRequestDetail } from '@/services/adminEstimateRequestApi';

import type { AdminEstimateRequestDetailQuery } from '@/types/adminEstimateRequest';

interface UseAdminEstimateRequestDetailOptions {
  /** false면 상세를 호출하지 않는다. estimateRequestId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
  /** 목록과 동일한 필터·정렬. prevId/nextId 계산에 사용한다. */
  query?: AdminEstimateRequestDetailQuery;
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
    queryKey: ADMIN_ESTIMATE_REQUEST_QUERY_KEYS.detail(
      estimateRequestId ?? null,
      options?.query
    ),
    queryFn: () =>
      getAdminEstimateRequestDetail(estimateRequestId!, options?.query),
    // Drawer가 열려 있고 견적 요청이 선택된 경우에만 호출한다.
    enabled: (options?.enabled ?? true) && estimateRequestId != null,
    retry: false,
  });
