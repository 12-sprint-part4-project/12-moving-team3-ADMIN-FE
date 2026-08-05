/**
 * 관리자 신고 목록 API 타입.
 * 백엔드 Swagger(admin-report)와 controller 응답(`{ data: ... }`) 구조에 맞춘다.
 */

export type AdminReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

export type AdminReportTarget =
  | 'USER'
  | 'REVIEW'
  | 'CHAT_ROOM'
  | 'MESSAGE'
  | 'ARTICLE'
  | 'COMMENT';

export type AdminReportCategory =
  | 'INAPPROPRIATE_PROFILE'
  | 'ABUSIVE_LANGUAGE';

export type AdminReportUserType = 'CUSTOMER' | 'MOVER';

/** Prisma ChatRoomType */
export type AdminReportChatRoomType = 'GENERAL' | 'DESIGNATED' | 'COMMUNITY';

/** Prisma MessageType */
export type AdminReportMessageType = 'TEXT' | 'IMAGE';

/** Prisma PostsCategory */
export type AdminReportPostsCategory =
  | 'MOVING_TIP'
  | 'QUESTION'
  | 'REVIEW'
  | 'ETC'
  | 'FURNITURE_SHARE';

export interface AdminReportReporter {
  id: string;
  name: string;
  nickname: string;
  email: string;
  userType: AdminReportUserType;
}

export interface AdminReportTargetAuthor {
  id: string;
  name: string;
  nickname: string;
}

export interface AdminReportUserTargetInfo {
  type: 'USER';
  id: string;
  name: string;
  nickname: string;
  email: string;
  userType: AdminReportUserType;
}

export interface AdminReportReviewTargetInfo {
  type: 'REVIEW';
  id: number;
  rating: number;
  content: string;
  author: AdminReportTargetAuthor | null;
}

export interface AdminReportChatRoomTargetInfo {
  type: 'CHAT_ROOM';
  id: number;
  roomType: AdminReportChatRoomType;
  createdAt: string;
}

export interface AdminReportMessageTargetInfo {
  type: 'MESSAGE';
  id: number;
  content: string;
  messageType: AdminReportMessageType;
  sender: AdminReportTargetAuthor | null;
}

export interface AdminReportArticleTargetInfo {
  type: 'ARTICLE';
  id: number;
  title: string;
  category: AdminReportPostsCategory;
  author: AdminReportTargetAuthor | null;
}

export interface AdminReportCommentTargetInfo {
  type: 'COMMENT';
  id: number;
  content: string;
  author: AdminReportTargetAuthor | null;
}

/** 신고 대상 요약. 삭제·미존재 시 null */
export type AdminReportTargetInfo =
  | AdminReportUserTargetInfo
  | AdminReportReviewTargetInfo
  | AdminReportChatRoomTargetInfo
  | AdminReportMessageTargetInfo
  | AdminReportArticleTargetInfo
  | AdminReportCommentTargetInfo;

/**
 * GET /api/admin/reports 쿼리 파라미터.
 * status·target 미전달은 전체 조회. page·pageSize는 BE 기본값을 쓰며 이번 단계에서 UI는 건드리지 않는다.
 */
export interface AdminReportListQuery {
  status?: AdminReportStatus;
  target?: AdminReportTarget;
  page?: number;
  pageSize?: number;
}

/** GET /api/admin/reports 목록 아이템 */
export interface AdminReportListItem {
  id: number;
  reporterId: string;
  reporter: AdminReportReporter;
  target: AdminReportTarget;
  targetId: string;
  targetInfo: AdminReportTargetInfo | null;
  category: AdminReportCategory;
  status: AdminReportStatus;
  /** ISO date-time 문자열 */
  createdAt: string;
}

/** 목록 페이지네이션 — 회원 목록과 동일 필드 */
export interface AdminReportPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** 목록 조회 성공 시 data 필드 */
export interface AdminReportListData {
  items: AdminReportListItem[];
  pagination: AdminReportPagination;
}

/** GET /api/admin/reports 성공 응답 */
export interface AdminReportListResponse {
  data: AdminReportListData;
}
