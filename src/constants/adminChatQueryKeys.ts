import type {
  AdminChatDetailQuery,
  AdminChatListQuery,
  AdminChatMessagesQuery,
} from '@/types/adminChat';

/**
 * 관리자 채팅 조회용 queryKey.
 * 목록·상세·메시지 캐시 무효화 시 공통으로 재사용한다.
 */
export const ADMIN_CHAT_QUERY_KEYS = {
  all: ['adminChats'] as const,
  lists: () => [...ADMIN_CHAT_QUERY_KEYS.all, 'list'] as const,
  list: (params?: AdminChatListQuery) =>
    [...ADMIN_CHAT_QUERY_KEYS.lists(), params] as const,
  details: () => [...ADMIN_CHAT_QUERY_KEYS.all, 'detail'] as const,
  detail: (roomId: number | null, params?: AdminChatDetailQuery) =>
    [...ADMIN_CHAT_QUERY_KEYS.details(), roomId, params] as const,
  messages: () => [...ADMIN_CHAT_QUERY_KEYS.all, 'messages'] as const,
  messageList: (roomId: number, params?: AdminChatMessagesQuery) =>
    [...ADMIN_CHAT_QUERY_KEYS.messages(), roomId, params] as const,
};
