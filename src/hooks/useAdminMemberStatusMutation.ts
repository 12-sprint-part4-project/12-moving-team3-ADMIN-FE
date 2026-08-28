import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';

import { ADMIN_MEMBER_QUERY_KEYS } from '@/constants/adminMemberQueryKeys';
import {
  activateAdminMember,
  suspendAdminMember,
} from '@/services/adminMemberApi';

/** 상태 변경 성공 후 목록·상세 캐시를 함께 무효화한다. */
const invalidateAdminMemberQueries = (queryClient: QueryClient) => {
  void queryClient.invalidateQueries({
    queryKey: ADMIN_MEMBER_QUERY_KEYS.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: ADMIN_MEMBER_QUERY_KEYS.details(),
  });
};

/** 관리자 회원 계정 정지 mutation. 성공 시 목록·상세를 갱신한다. */
export const useSuspendAdminMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendAdminMember,
    onSuccess: () => {
      invalidateAdminMemberQueries(queryClient);
    },
  });
};

/** 관리자 회원 계정 활성화 mutation. 성공 시 목록·상세를 갱신한다. */
export const useActivateAdminMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateAdminMember,
    onSuccess: () => {
      invalidateAdminMemberQueries(queryClient);
    },
  });
};
