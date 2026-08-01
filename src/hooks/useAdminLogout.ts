import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { clearAdminAccessToken } from '@/lib/adminAccessToken';
import { logoutAdmin } from '@/services/adminAuthApi';

/**
 * 관리자 로그아웃.
 * API 성공/실패와 관계없이 프론트 인증 정보를 정리한 뒤 로그인으로 이동한다.
 */
export const useAdminLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: logoutAdmin,
  });

  const logout = async (): Promise<void> => {
    try {
      await mutation.mutateAsync();
    } catch {
      // 로그아웃 API 실패 시에도 로컬 인증 상태는 반드시 정리한다.
    } finally {
      clearAdminAccessToken();
      // /me 포함 관리자 관련 React Query 캐시를 모두 제거한다.
      queryClient.clear();
      router.replace('/login');
    }
  };

  return {
    logout,
    isPending: mutation.isPending,
  };
};
