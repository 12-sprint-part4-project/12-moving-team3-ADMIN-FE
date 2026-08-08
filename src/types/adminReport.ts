/**
 * 관리자 신고 목록·상세·처리/반려 API 타입.
 * 백엔드 Swagger(admin-report)와 controller 응답(`{ data: ... }`) 구조에 맞춘다.
 */

import type {
  MemberMoveType,
  MemberRegion,
  MemberStatus,
} from '@/types/adminMember';

export type AdminReportStatus = 'PENDING' | 'RESOLVED' | 'REJECTED';

/** Prisma Region — 회원 상세와 동일 enum을 재사용한다 */
export type AdminReportRegion = MemberRegion;

/** Prisma MoveType — 회원 상세와 동일 enum을 재사용한다 */
export type AdminReportMoveType = MemberMoveType;

/**
 * 신고 처리(resolve) 시 관리자가 선택하는 Action.
 * Prisma enum이 아니라 요청 계약 전용 — 여러 파일에 문자열을 중복 선언하지 않는다.
 */
export type AdminReportProcessAction =
  | 'SUSPEND_TARGET_USER'
  | 'DELETE_REPORTED_CONTENT';

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
 * status·target·검색·신고일 미전달은 전체 조회.
 * page·pageSize는 BE 기본값을 쓰며, 날짜는 YYYY-MM-DD 문자열로 유지한다.
 */
export interface AdminReportListQuery {
  status?: AdminReportStatus;
  target?: AdminReportTarget;
  /** 신고 대상 사용자 검색어 (이름·닉네임·이메일) */
  targetUserKeyword?: string;
  /** 신고일 시작일 (YYYY-MM-DD, UserReport.createdAt) */
  reportedFrom?: string;
  /** 신고일 종료일 (YYYY-MM-DD). reportedFrom 없이 단독 전달 불가 */
  reportedTo?: string;
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

/** 신고를 처리한 관리자 요약. PENDING이면 null */
export interface AdminReportAdmin {
  id: number;
  name: string;
  email: string;
}

/**
 * 신고자 상세.
 * 목록 요약(AdminReportReporter)에 탈퇴 상태·프로필 이미지를 더한다.
 */
export interface AdminReportDetailReporter extends AdminReportReporter {
  isDeleted: boolean;
  /** ISO date-time. 미탈퇴면 null */
  deletedAt: string | null;
  /** User.profileImageKey. 없으면 null */
  profileImageKey: string | null;
}

/** 일반 회원(CUSTOMER) 프로필 요약. 전화번호는 포함하지 않는다. */
export interface AdminReportDetailCustomerProfile {
  region: AdminReportRegion | null;
  service: AdminReportMoveType[];
}

/** 기사(MOVER) 서비스 가능 지역 */
export interface AdminReportDetailMoverServiceRegion {
  region: AdminReportRegion;
}

/** 기사(MOVER) 프로필 요약 */
export interface AdminReportDetailMoverProfile {
  service: AdminReportMoveType[];
  career: number | null;
  shortDescription: string | null;
  description: string | null;
  serviceRegions: AdminReportDetailMoverServiceRegion[];
}

/**
 * 신고 대상 사용자의 역할별 프로필 묶음.
 * CUSTOMER/MOVER 중 해당 타입만 채우고 나머지는 null이다.
 */
export interface AdminReportDetailUserProfile {
  customer: AdminReportDetailCustomerProfile | null;
  mover: AdminReportDetailMoverProfile | null;
}

/**
 * 대상·콘텐츠에 연결된 사용자 요약.
 * 작성자/발신자가 없으면 null로 둔다.
 * USER 대상 상세에서는 profileImageKey·profile이 채워질 수 있다.
 * 다른 target 작성자 요약에는 없을 수 있어 optional로 둔다.
 */
export interface AdminReportDetailUserSummary {
  id: string;
  name: string;
  nickname: string;
  email: string;
  userType: AdminReportUserType;
  isDeleted: boolean;
  deletedAt: string | null;
  /** User.profileImageKey. 없으면 null */
  profileImageKey?: string | null;
  /** 일반/기사 프로필. 프로필 row가 없으면 null */
  profile?: AdminReportDetailUserProfile | null;
}

/**
 * 신고 대상 상태.
 * 목록은 미존재·삭제 시 targetInfo를 null로 두지만,
 * 상세는 exists/isDeleted로 구분해 "없음"과 "삭제됨"을 다르게 표시한다.
 */
export interface AdminReportDetailTargetInfo {
  type: AdminReportTarget;
  id: string;
  exists: boolean;
  isDeleted: boolean;
  user: AdminReportDetailUserSummary | null;
}

/**
 * 신고된 콘텐츠 본문.
 * USER 대상처럼 별도 콘텐츠가 없으면 상위 content가 null이다.
 * metadata는 target별 전용 필드(rating, messageType 등)용 확장 슬롯이다.
 */
export interface AdminReportDetailContent {
  type: AdminReportTarget;
  id: string;
  title: string | null;
  body: string | null;
  createdAt: string | null;
  deletedAt: string | null;
  metadata: Record<string, unknown> | null;
}

/**
 * 신고 처리용 대상 사용자 요약.
 * 없으면 null. status는 회원 상태(MemberStatus)와 동일하다.
 * UserStatusInfo가 없으면 BE가 ACTIVE·null로 정규화한다.
 */
export interface AdminReportDetailTargetUser {
  id: string;
  name: string;
  nickname: string;
  /** User.profileImageKey. 없으면 null */
  profileImageKey: string | null;
  status: MemberStatus;
  /** ISO date-time. 미정지면 null */
  suspendedAt: string | null;
  /** ISO date-time. 미정지면 null */
  suspendedUntil: string | null;
  /** 해당 회원이 직접·작성 콘텐츠를 통해 받은 신고 누적 횟수 */
  reportCount: number;
}

/** 신고 상세에서 선택 가능한 Action 플래그 */
export interface AdminReportAvailableActions {
  canSuspendUser: boolean;
  canDeleteContent: boolean;
}

export interface AdminReportDetailReportedReviewContent {
  type: 'REVIEW';
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface AdminReportDetailReportedArticleContent {
  type: 'ARTICLE';
  id: string;
  category: AdminReportPostsCategory;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminReportDetailReportedCommentContent {
  type: 'COMMENT';
  id: string;
  postId: number;
  parentId: number | null;
  content: string;
  createdAt: string;
  deletedAt: string | null;
}

/** 메시지는 soft-delete가 없어 deletedAt을 두지 않는다 */
export interface AdminReportDetailReportedMessageContent {
  type: 'MESSAGE';
  id: string;
  roomId: number;
  messageType: AdminReportMessageType;
  content: string;
  isFiltered: boolean;
  createdAt: string;
}

/**
 * USER 신고 — 기사(MOVER) 프로필 콘텐츠.
 * type + userType으로 판별한다. email·deletedAt은 포함하지 않는다.
 * serviceRegions는 상세 프로필 타입을 재사용한다.
 */
export interface AdminReportDetailReportedMoverProfileContent {
  type: 'USER';
  userType: 'MOVER';
  id: string;
  name: string;
  nickname: string;
  profileImageKey: string | null;
  shortDescription: string | null;
  description: string | null;
  career: number | null;
  service: AdminReportMoveType[];
  serviceRegions: AdminReportDetailMoverServiceRegion[];
}

/**
 * USER 신고 — 고객(CUSTOMER) 프로필 콘텐츠.
 * type + userType으로 판별한다. 전화번호·email은 포함하지 않는다.
 */
export interface AdminReportDetailReportedCustomerProfileContent {
  type: 'USER';
  userType: 'CUSTOMER';
  id: string;
  name: string;
  nickname: string;
  profileImageKey: string | null;
  region: AdminReportRegion | null;
  service: AdminReportMoveType[];
}

/**
 * 신고된 콘텐츠 상세.
 * USER는 회원 프로필, 그 외는 콘텐츠 row.
 * 프로필/콘텐츠 미존재·조회 실패면 null. type(+userType)으로 구분한다.
 */
export type AdminReportDetailReportedContent =
  | AdminReportDetailReportedReviewContent
  | AdminReportDetailReportedArticleContent
  | AdminReportDetailReportedCommentContent
  | AdminReportDetailReportedMessageContent
  | AdminReportDetailReportedMoverProfileContent
  | AdminReportDetailReportedCustomerProfileContent;

/** GET /api/admin/reports/:reportId 성공 시 data 필드 */
export interface AdminReportDetail {
  id: number;
  target: AdminReportTarget;
  targetId: string;
  category: AdminReportCategory;
  status: AdminReportStatus;
  /** 미처리(PENDING)면 null */
  adminId: number | null;
  admin: AdminReportAdmin | null;
  createdAt: string;
  reporter: AdminReportDetailReporter;
  targetInfo: AdminReportDetailTargetInfo;
  content: AdminReportDetailContent | null;
  /** 정지 Action용 대상 사용자. 없으면 null */
  targetUser: AdminReportDetailTargetUser | null;
  /**
   * 콘텐츠 삭제 Action·표시용.
   * USER는 회원 프로필, 그 외는 콘텐츠. 프로필/콘텐츠 없으면 null.
   */
  reportedContent: AdminReportDetailReportedContent | null;
  availableActions: AdminReportAvailableActions;
}

/** GET /api/admin/reports/:reportId 성공 응답 */
export interface AdminReportDetailResponse {
  data: AdminReportDetail;
}

/** POST /api/admin/reports/:reportId/resolve 요청 Body */
export interface AdminReportResolveBody {
  actions: AdminReportProcessAction[];
}

/**
 * POST resolve 성공 시 data 필드.
 * JSON 직렬화 후 Date는 ISO 문자열이므로 processedAt은 string이다.
 */
export interface AdminReportResolveData {
  reportId: number;
  status: AdminReportStatus;
  adminId: number;
  actions: AdminReportProcessAction[];
  processedAt: string;
  /**
   * DELETE_REPORTED_CONTENT가 포함된 경우에만 채운다.
   * true면 이미 삭제된 콘텐츠를 성공으로 간주한 경우.
   */
  contentAlreadyDeleted: boolean | null;
}

/** POST /api/admin/reports/:reportId/resolve 성공 응답 */
export interface AdminReportResolveResponse {
  data: AdminReportResolveData;
}

/**
 * POST reject 성공 시 data 필드.
 * Action이 없으므로 resolve 결과와 분리한다.
 */
export interface AdminReportRejectData {
  reportId: number;
  status: AdminReportStatus;
  adminId: number;
  processedAt: string;
}

/** POST /api/admin/reports/:reportId/reject 성공 응답 */
export interface AdminReportRejectResponse {
  data: AdminReportRejectData;
}

/** GET /api/admin/reports/statistics 쿼리 파라미터 */
export interface AdminReportStatisticsQuery {
  startDate?: string;
  endDate?: string;
}

/** GET /api/admin/reports/statistics 성공 시 data 필드 */
export interface AdminReportStatistics {
  totalReportCount: number;
  pendingReportCount: number;
  resolvedReportCount: number;
  rejectedReportCount: number;
}

/** GET /api/admin/reports/statistics 성공 응답 */
export interface AdminReportStatisticsResponse {
  data: AdminReportStatistics;
}
