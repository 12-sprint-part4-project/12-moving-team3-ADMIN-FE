import { useQuery } from '@tanstack/react-query';

import { getAdminMe } from '@/services/adminAuthApi';

/** 관리자 /me 조회용 queryKey. 로그아웃·캐시 무효화 시 재사용한다. */
export const adminMeQueryKey = ['adminMe'] as const;

/** 현재 로그인한 관리자 정보 조회. 접근 제어·헤더 표시 등에서 공유한다. */
export const useAdminMe = () =>
  useQuery({
    queryKey: adminMeQueryKey,
    queryFn: getAdminMe,
  });
