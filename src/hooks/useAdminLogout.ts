import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { adminMeQueryKey } from '@/hooks/useAdminMe';
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
      // /me 캐시를 먼저 제거하고, 나머지 관리자 관련 캐시도 초기화한다.
      queryClient.removeQueries({ queryKey: adminMeQueryKey });
      queryClient.clear();
      router.replace('/login');
    }
  };

  return {
    logout,
    isPending: mutation.isPending,
  };
};
