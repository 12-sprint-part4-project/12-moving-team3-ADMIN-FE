/**
 * 관리자 신고 목록 UI용 타입.
 * 백엔드 AdminReportListItemDto와 맞춰 두어 이후 API 연동 시 변환을 최소화한다.
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
  roomType: string;
  createdAt: string;
}

export interface AdminReportMessageTargetInfo {
  type: 'MESSAGE';
  id: number;
  content: string;
  messageType: string;
  sender: AdminReportTargetAuthor | null;
}

export interface AdminReportArticleTargetInfo {
  type: 'ARTICLE';
  id: number;
  title: string;
  category: string;
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

/** 신고 목록 테이블 row */
export interface AdminReportListItem {
  id: number;
  reporterId: string;
  reporter: AdminReportReporter;
  target: AdminReportTarget;
  targetId: string;
  targetInfo: AdminReportTargetInfo | null;
  category: AdminReportCategory;
  status: AdminReportStatus;
  createdAt: string;
}
