/**
 * 관리자 회원 관리 API 타입.
 * 백엔드 Swagger(admin-member)와 controller 응답(`{ data: ... }`) 구조에 맞춘다.
 */

/** User.userType */
export type MemberUserType = 'CUSTOMER' | 'MOVER';

/** UserStatusInfo.status (목록에서는 관계 부재 시 ACTIVE로 정규화) */
export type MemberStatus = 'ACTIVE' | 'SUSPENDED';

/** Prisma Region enum */
export type MemberRegion =
  | 'SEOUL'
  | 'GYEONGGI'
  | 'INCHEON'
  | 'GANGWON'
  | 'CHUNGBUK'
  | 'CHUNGNAM'
  | 'SEJONG'
  | 'DAEJEON'
  | 'JEONBUK'
  | 'GWANGJU_JEONNAM'
  | 'GYEONGBUK'
  | 'DAEGU'
  | 'ULSAN'
  | 'GYEONGNAM'
  | 'BUSAN'
  | 'JEJU';

/** Prisma MoveType enum (프로필 service 배열) */
export type MemberMoveType = 'SMALL' | 'HOME' | 'OFFICE';

/** GET /api/admin/members 쿼리 파라미터 */
export interface AdminMemberListQuery {
  userType?: MemberUserType;
  status?: MemberStatus;
  search?: string;
  /** 가입 기간 시작일 (YYYY-MM-DD). 없으면 전체 기간 */
  startDate?: string;
  /** 가입 기간 종료일 (YYYY-MM-DD). startDate 없이 단독 전달 불가 */
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/** 목록 페이지네이션 */
export interface AdminMemberPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** GET /api/admin/members 목록 아이템 */
export interface AdminMemberListItem {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phoneNumber: string | null;
  userType: MemberUserType;
  status: MemberStatus;
  suspendedAt: string | null;
  suspendedUntil: string | null;
  createdAt: string;
  /** MOVER 평균 평점. CUSTOMER이거나 리뷰가 없으면 null */
  averageRating: number | null;
}

/** 목록 조회 성공 시 data 필드 */
export interface AdminMemberListData {
  items: AdminMemberListItem[];
  pagination: AdminMemberPagination;
}

/** GET /api/admin/members 성공 응답 */
export interface AdminMemberListResponse {
  data: AdminMemberListData;
}

/** 상세의 계정 상태. UserStatusInfo가 없으면 null */
export interface AdminMemberUserStatus {
  status: MemberStatus;
  suspendedAt: string | null;
  suspendedUntil: string | null;
}

/** CUSTOMER 프로필. CUSTOMER가 아니거나 없으면 null */
export interface CustomerProfile {
  id: number;
  region: MemberRegion | null;
  service: MemberMoveType[];
  createdAt: string;
  updatedAt: string;
}

/** MOVER 서비스 가능 지역 */
export interface MoverServiceRegion {
  region: MemberRegion;
}

/** MOVER 프로필. MOVER가 아니거나 없으면 null */
export interface MoverProfile {
  id: number;
  service: MemberMoveType[];
  career: number | null;
  shortDescription: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  serviceRegions: MoverServiceRegion[];
}

/** GET /api/admin/members/:memberId 성공 시 data 필드 */
export interface AdminMemberDetail {
  id: string;
  name: string;
  nickname: string;
  email: string;
  phoneNumber: string | null;
  profileImageKey: string | null;
  userType: MemberUserType;
  createdAt: string;
  userStatus: AdminMemberUserStatus | null;
  customerProfile: CustomerProfile | null;
  moverProfile: MoverProfile | null;
  reportCount: number;
  averageRating: number | null;
  reviewCount: number;
  confirmedQuoteCount: number;
}

/** GET /api/admin/members/:memberId 성공 응답 */
export interface AdminMemberDetailResponse {
  data: AdminMemberDetail;
}

/**
 * PATCH 정지/활성화 성공 시 data 필드.
 * JSON 직렬화 후 Date는 ISO 문자열이므로 string | null로 둔다.
 */
export interface AdminMemberStatusChangeData {
  memberId: string;
  status: MemberStatus;
  suspendedAt: string | null;
  suspendedUntil: string | null;
}

/** PATCH /api/admin/members/:memberId/suspend|activate 성공 응답 */
export interface AdminMemberStatusChangeResponse {
  data: AdminMemberStatusChangeData;
}
