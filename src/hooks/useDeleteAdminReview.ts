import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';
import { deleteAdminReview } from '@/services/adminReviewApi';

/**
 * 삭제 성공 후 목록·통계 캐시를 무효화한다.
 * lists()/statisticses() prefix로 현재 조건의 목록·통계가 다시 조회된다.
 */
const invalidateAdminReviewQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({
    queryKey: ADMIN_REVIEW_QUERY_KEYS.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: ADMIN_REVIEW_QUERY_KEYS.statisticses(),
  });
  void queryClient.invalidateQueries({
    queryKey: ADMIN_REVIEW_QUERY_KEYS.details(),
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
