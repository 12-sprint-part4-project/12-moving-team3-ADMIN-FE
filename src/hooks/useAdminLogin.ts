import { useMutation } from '@tanstack/react-query';

import { loginAdmin } from '@/services/adminAuthApi';
import { setAdminAccessToken } from '@/lib/adminAccessToken';
import type { AdminLoginRequest } from '@/types/adminAuth';

/** 관리자 로그인 mutation. 성공 시 Access Token만 메모리에 저장한다. */
export const useAdminLogin = () =>
  useMutation({
    mutationFn: (body: AdminLoginRequest) => loginAdmin(body),
    onSuccess: (response) => {
      // BE 응답: { data: { accessToken, admin } }
      setAdminAccessToken(response.data.accessToken);
    },
  });
