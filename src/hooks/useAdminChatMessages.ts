import { useQuery } from '@tanstack/react-query';

import { ADMIN_CHAT_QUERY_KEYS } from '@/constants/adminChatQueryKeys';
import { getAdminChatMessages } from '@/services/adminChatApi';
import type { AdminChatMessagesQuery } from '@/types/adminChat';

interface UseAdminChatMessagesOptions {
  /** false면 메시지를 호출하지 않는다. roomId가 없으면 기본으로 비활성이다. */
  enabled?: boolean;
}

/**
 * 관리자 채팅 메시지 한 페이지 조회.
 * before·limit이 바뀌면 queryKey가 달라져 커서별 캐시가 분리된다.
 * 누적·reverse·더 보기는 UI 단계에서 처리한다.
 * (전역 QueryProvider도 retry: false이지만, useAdminMemberDetail과 동일하게 명시한다.)
 */
export const useAdminChatMessages = (
  roomId?: number | null,
  params?: AdminChatMessagesQuery,
  options?: UseAdminChatMessagesOptions
) =>
  useQuery({
    queryKey: ADMIN_CHAT_QUERY_KEYS.messageList(roomId ?? 0, params),
    queryFn: () => {
      if (roomId == null) {
        return Promise.reject(new Error('roomId is required'));
      }

      return getAdminChatMessages(roomId, params);
    },
    enabled: (options?.enabled ?? true) && roomId != null,
    retry: false,
  });
