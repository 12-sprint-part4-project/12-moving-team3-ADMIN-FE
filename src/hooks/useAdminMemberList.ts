import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { ADMIN_MEMBER_QUERY_KEYS } from '@/constants/adminMemberQueryKeys';
import { getAdminMemberList } from '@/services/adminMemberApi';

import type { AdminMemberListQuery } from '@/types/adminMember';

interface UseAdminMemberListOptions {
  /** false면 목록을 호출하지 않는다. */
  enabled?: boolean;
}

/**
 * 관리자 회원 목록 조회.
 * params가 바뀌면 queryKey가 달라져 필터·페이지별 캐시가 분리된다.
 * keepPreviousData로 page/search/filter 변경 중에도 이전 목록을 유지한다.
 * (전역 QueryProvider도 retry: false이지만, useAdminMe와 동일하게 명시한다.)
 */
export const useAdminMemberList = (
  params?: AdminMemberListQuery,
  options?: UseAdminMemberListOptions
) =>
  useQuery({
    queryKey: ADMIN_MEMBER_QUERY_KEYS.list(params),
    queryFn: () => getAdminMemberList(params),
    enabled: options?.enabled ?? true,
    placeholderData: keepPreviousData,
    retry: false,
  });
