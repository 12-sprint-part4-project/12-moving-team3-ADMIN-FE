import { useQuery } from '@tanstack/react-query';

import { ADMIN_COMPLETED_QUERY_KEYS } from '@/constants/adminCompletedQueryKeys';
import { getAdminCompletedDetail } from '@/services/adminCompletedApi';

import type { AdminCompletedDetailQuery } from '@/types/adminCompleted';

interface UseAdminCompletedDetailOptions {
  /** false면 상세를 호출하지 않는다. estimateRequestId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
  /** 목록과 동일한 필터·정렬. prevId/nextId 계산에 사용한다. */
  query?: AdminCompletedDetailQuery;
}

/**
 * 관리자 완료 건 상세 조회.
 * estimateRequestId가 없으면 요청하지 않는다(Drawer 미선택 등).
 */
export const useAdminCompletedDetail = (
  estimateRequestId?: number | null,
  options?: UseAdminCompletedDetailOptions
) =>
  useQuery({
    queryKey: ADMIN_COMPLETED_QUERY_KEYS.detail(
      estimateRequestId ?? null,
      options?.query
    ),
    queryFn: () => getAdminCompletedDetail(estimateRequestId!, options?.query),
    // Drawer가 열려 있고 완료 건이 선택된 경우에만 호출한다.
    enabled: (options?.enabled ?? true) && estimateRequestId != null,
    retry: false,
  });
