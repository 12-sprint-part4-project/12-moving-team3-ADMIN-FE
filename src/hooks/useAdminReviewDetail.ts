import { useQuery } from '@tanstack/react-query';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';
import { getAdminReviewDetail } from '@/services/adminReviewApi';

import type { AdminReviewDetailQuery } from '@/types/adminReview';

interface UseAdminReviewDetailOptions {
  /** false면 상세를 호출하지 않는다. reviewId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
  /** 목록과 동일한 필터·정렬. prevId/nextId 계산에 사용한다. */
  query?: AdminReviewDetailQuery;
}

/**
 * 관리자 리뷰 상세 조회.
 * reviewId가 없으면 요청하지 않는다(Drawer 미선택 등).
 */
export const useAdminReviewDetail = (
  reviewId?: number | null,
  options?: UseAdminReviewDetailOptions
) =>
  useQuery({
    queryKey: ADMIN_REVIEW_QUERY_KEYS.detail(reviewId ?? null, options?.query),
    queryFn: () => {
      if (reviewId == null) {
        return Promise.reject(new Error('reviewId is required'));
      }

      return getAdminReviewDetail(reviewId, options?.query);
    },
    enabled: (options?.enabled ?? true) && reviewId != null,
    retry: false,
  });
