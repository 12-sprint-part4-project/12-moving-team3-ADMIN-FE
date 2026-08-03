import { useQuery } from '@tanstack/react-query';

import { ADMIN_MEMBER_QUERY_KEYS } from '@/constants/adminMemberQueryKeys';
import { getAdminMemberDetail } from '@/services/adminMemberApi';

interface UseAdminMemberDetailOptions {
  /** false면 상세를 호출하지 않는다. memberId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
}

/**
 * 관리자 회원 상세 조회.
 * memberId가 없으면 요청하지 않는다(Drawer 미선택 등).
 * (전역 QueryProvider도 retry: false이지만, useAdminMe와 동일하게 명시한다.)
 */
export const useAdminMemberDetail = (
  memberId?: string | null,
  options?: UseAdminMemberDetailOptions
) =>
  useQuery({
    queryKey: ADMIN_MEMBER_QUERY_KEYS.detail(memberId ?? ''),
    queryFn: () => {
      if (!memberId) {
        return Promise.reject(new Error('memberId is required'));
      }

      return getAdminMemberDetail(memberId);
    },
    enabled: (options?.enabled ?? true) && Boolean(memberId),
    retry: false,
  });
