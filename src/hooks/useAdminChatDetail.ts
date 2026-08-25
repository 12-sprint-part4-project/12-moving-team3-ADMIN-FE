import { useQuery } from '@tanstack/react-query';

import { ADMIN_CHAT_QUERY_KEYS } from '@/constants/adminChatQueryKeys';
import { getAdminChatDetail } from '@/services/adminChatApi';

import type { AdminChatDetailQuery } from '@/types/adminChat';

interface UseAdminChatDetailOptions {
  /** false면 상세를 호출하지 않는다. roomId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
  /** 목록과 동일한 필터. prevId/nextId 계산에 사용한다. */
  query?: AdminChatDetailQuery;
}

/**
 * 관리자 채팅방 상세 조회.
 * roomId가 없으면 요청하지 않는다(Drawer 미선택 등).
 * (전역 QueryProvider도 retry: false이지만, useAdminMemberDetail과 동일하게 명시한다.)
 */
export const useAdminChatDetail = (
  roomId?: number | null,
  options?: UseAdminChatDetailOptions
) =>
  useQuery({
    queryKey: ADMIN_CHAT_QUERY_KEYS.detail(roomId ?? null, options?.query),
    queryFn: () => {
      if (roomId == null) {
        return Promise.reject(new Error('roomId is required'));
      }

      return getAdminChatDetail(roomId, options?.query);
    },
    // Drawer가 열려 있고 채팅방이 선택된 경우에만 호출한다.
    enabled: (options?.enabled ?? true) && roomId != null,
    retry: false,
  });
