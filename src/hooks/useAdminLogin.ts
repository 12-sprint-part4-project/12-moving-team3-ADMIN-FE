import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ADMIN_ME_QUERY_KEY } from '@/hooks/useAdminMe';
import { setAdminAccessToken } from '@/lib/adminAccessToken';
import { loginAdmin } from '@/services/adminAuthApi';

import type { AdminLoginRequest } from '@/types/adminAuth';

/** 관리자 로그인 mutation. 성공 시 Access Token만 메모리에 저장한다. */
export const useAdminLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdminLoginRequest) => loginAdmin(body),
    onSuccess: (response) => {
      // BE 응답: { data: { accessToken, admin } }
      setAdminAccessToken(response.data.accessToken);
      // 이전 /me 실패 캐시가 남아 Guard가 즉시 로그인으로 되돌리는 것을 막는다.
      queryClient.setQueryData(ADMIN_ME_QUERY_KEY, {
        data: response.data.admin,
      });
    },
  });
};
