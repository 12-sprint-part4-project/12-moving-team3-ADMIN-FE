/**
 * 관리자 채팅 목록·상세·메시지 API 타입.
 * 백엔드 Swagger(admin-chat)와 controller 응답(`{ data: ... }`) 구조에 맞춘다.
 */

import type { MemberUserType } from '@/types/adminMember';

/** Prisma ChatRoomType */
export type AdminChatRoomType = 'GENERAL' | 'DESIGNATED' | 'COMMUNITY';

/** Prisma MessageType */
export type AdminChatMessageType = 'TEXT' | 'IMAGE';

/** User.userType — 회원 관리와 동일 enum을 재사용한다 */
export type AdminChatUserType = MemberUserType;

/** GET /api/admin/chats 쿼리 파라미터 */
export interface AdminChatListQuery {
  search?: string;
  roomType?: AdminChatRoomType;
  page?: number;
  pageSize?: number;
}

/**
 * 목록 페이지네이션.
 * 공통 Pagination 타입이 없어 회원/신고와 동일 필드로 도메인별 정의한다.
 */
export interface AdminChatPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** 목록·상세 공통 참여자 */
export interface AdminChatParticipant {
  id: string;
  name: string;
  nickname: string;
  email: string;
  userType: AdminChatUserType;
  joinedAt: string;
  leftAt: string | null;
  isDeleted: boolean;
}

/** 목록용 마지막 메시지 요약. 메시지가 없으면 null */
export interface AdminChatLastMessage {
  id: number;
  senderId: string;
  content: string;
  messageType: AdminChatMessageType;
  createdAt: string;
}

/** GET /api/admin/chats 목록 아이템 */
export interface AdminChatListItem {
  id: number;
  roomType: AdminChatRoomType;
  estimateRequestId: number | null;
  quoteId: number | null;
  communityPostId: number | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: AdminChatParticipant[];
  lastMessage: AdminChatLastMessage | null;
}

/** 목록 조회 성공 시 data 필드 */
export interface AdminChatListData {
  items: AdminChatListItem[];
  pagination: AdminChatPagination;
}

/** GET /api/admin/chats 성공 응답 */
export interface AdminChatListResponse {
  data: AdminChatListData;
}

/** GET /api/admin/chats/:roomId 상세 */
export interface AdminChatDetail {
  id: number;
  roomType: AdminChatRoomType;
  estimateRequestId: number | null;
  quoteId: number | null;
  designatedMoverId: number | null;
  communityPostId: number | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: AdminChatParticipant[];
}

/** GET /api/admin/chats/:roomId 성공 응답 */
export interface AdminChatDetailResponse {
  data: AdminChatDetail;
}

/** 메시지 발신자 요약 */
export interface AdminChatMessageSender {
  id: string;
  name: string;
  nickname: string;
  email: string;
  userType: AdminChatUserType;
  isDeleted: boolean;
}

/** GET /api/admin/chats/:roomId/messages 메시지 아이템 */
export interface AdminChatMessage {
  id: number;
  senderId: string;
  sender: AdminChatMessageSender;
  messageType: AdminChatMessageType;
  content: string;
  isFiltered: boolean;
  /** S3 Presigned URL 배열. 첨부가 없으면 빈 배열 */
  attachments: string[];
  createdAt: string;
}

/** GET /api/admin/chats/:roomId/messages 쿼리 파라미터 */
export interface AdminChatMessagesQuery {
  before?: number;
  limit?: number;
}

/** 메시지 커서 페이지네이션 meta */
export interface AdminChatMessagesMeta {
  hasNext: boolean;
  nextCursor: number | null;
}

/** 메시지 조회 성공 시 data 필드 */
export interface AdminChatMessagesData {
  messages: AdminChatMessage[];
  meta: AdminChatMessagesMeta;
}

/** GET /api/admin/chats/:roomId/messages 성공 응답 */
export interface AdminChatMessagesResponse {
  data: AdminChatMessagesData;
}
