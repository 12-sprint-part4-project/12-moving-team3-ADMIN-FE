import { useQuery } from '@tanstack/react-query';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';
import { getAdminReviewList } from '@/services/adminReviewApi';
import type { AdminReviewListQuery } from '@/types/adminReview';

interface UseAdminReviewListOptions {
  /** false면 목록을 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 리뷰 목록 조회.
 * params가 바뀌면 queryKey가 달라져 필터·페이지별 캐시가 분리된다.
 * (전역 QueryProvider도 retry: false이지만, useAdminMemberList와 동일하게 명시한다.)
 */
export const useAdminReviewList = (
  params?: AdminReviewListQuery,
  options?: UseAdminReviewListOptions
) =>
  useQuery({
    queryKey: ADMIN_REVIEW_QUERY_KEYS.list(params),
    queryFn: () => getAdminReviewList(params),
    enabled: options?.enabled ?? true,
    retry: false,
  });
