import {
  ADMIN_CHAT_LIST_PATH,
  getAdminChatDetailPath,
  getAdminChatMessagesPath,
} from '@/api/adminChatPaths';
import { axiosInstance } from '@/api/axiosInstance';

import type {
  AdminChatDetailResponse,
  AdminChatListQuery,
  AdminChatListResponse,
  AdminChatMessagesQuery,
  AdminChatMessagesResponse,
} from '@/types/adminChat';

/**
 * 관리자 채팅방 목록 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminChatList = async (
  params?: AdminChatListQuery
): Promise<AdminChatListResponse> => {
  const response = await axiosInstance.get<AdminChatListResponse>(
    ADMIN_CHAT_LIST_PATH,
    { params }
  );

  return response.data;
};

/**
 * 관리자 채팅방 상세 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminChatDetail = async (
  roomId: number
): Promise<AdminChatDetailResponse> => {
  const response = await axiosInstance.get<AdminChatDetailResponse>(
    getAdminChatDetailPath(roomId)
  );

  return response.data;
};

/**
 * 관리자 채팅 메시지 히스토리 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminChatMessages = async (
  roomId: number,
  params?: AdminChatMessagesQuery
): Promise<AdminChatMessagesResponse> => {
  const response = await axiosInstance.get<AdminChatMessagesResponse>(
    getAdminChatMessagesPath(roomId),
    { params }
  );

  return response.data;
};
