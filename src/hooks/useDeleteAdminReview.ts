import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';
import { deleteAdminReview } from '@/services/adminReviewApi';

/**
 * 삭제 성공 후 목록·통계 캐시를 무효화한다.
 * lists() prefix로 현재 검색·별점·page 조건을 포함한 목록이 다시 조회된다.
 */
const invalidateAdminReviewQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({
    queryKey: ADMIN_REVIEW_QUERY_KEYS.lists(),
  });
  // 삭제 건수·평균 평점 반영용. params별 statistics도 prefix로 묶는다.
  void queryClient.invalidateQueries({
    queryKey: [...ADMIN_REVIEW_QUERY_KEYS.all, 'statistics'],
  });
};

/** 관리자 리뷰 삭제 mutation. 성공 시 목록·통계를 갱신한다. */
export const useDeleteAdminReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminReview,
    onSuccess: () => {
      invalidateAdminReviewQueries(queryClient);
    },
  });
};
