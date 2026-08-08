/** 관리자 채팅 관리 API 경로. URL 비교·API 호출에서 공통으로 사용한다. */
export const ADMIN_CHAT_LIST_PATH = '/api/admin/chats';

/** GET /api/admin/chats/:roomId */
export const getAdminChatDetailPath = (roomId: number) =>
  `/api/admin/chats/${roomId}`;

/** GET /api/admin/chats/:roomId/messages */
export const getAdminChatMessagesPath = (roomId: number) =>
  `/api/admin/chats/${roomId}/messages`;
