import type { AdminListSortDirection } from '@/types/adminEstimateRequest';

/** GET /api/admin/reviews/statistics 쿼리 파라미터 */
export interface AdminReviewStatisticsQuery {
  startDate?: string;
  endDate?: string;
}

/** GET /api/admin/reviews/statistics 성공 시 data 필드 */
export interface AdminReviewStatistics {
  totalReviewCount: number;
  /** 삭제되지 않은 리뷰 평균 평점. 리뷰가 없으면 0 */
  averageReviewScore: number;
  deletedReviewCount: number;
}

/** GET /api/admin/reviews/statistics 성공 응답 */
export interface AdminReviewStatisticsResponse {
  data: AdminReviewStatistics;
}

/** 목록 작성자·기사 공통 userType */
export type AdminReviewUserType = 'CUSTOMER' | 'MOVER';

/**
 * 목록 작성자·기사 요약.
 * BE AdminReviewUserSummaryDto와 동일하다.
 */
export interface AdminReviewUserSummary {
  id: string;
  name: string;
  nickname: string;
  email: string;
  userType: AdminReviewUserType;
}

/** 작성자 — 필드 구조는 AdminReviewUserSummary와 동일 */
export type AdminReviewAuthor = AdminReviewUserSummary;

/** 기사 — 필드 구조는 AdminReviewUserSummary와 동일. 목록에서는 nullable */
export type AdminReviewMover = AdminReviewUserSummary;

/** 목록 삭제 상태 필터. 미전달 시 전체 */
export type AdminReviewDeletionStatus = 'ACTIVE' | 'DELETED';

/** GET /api/admin/reviews 쿼리 파라미터 */
export interface AdminReviewListQuery {
  id?: string;
  /** 작성자 이름 또는 닉네임 */
  userName?: string;
  /** 기사 이름 또는 닉네임 */
  moverName?: string;
  /** 1~5. 미전달 시 전체 별점 */
  rating?: number;
  /** 미전달 시 전체. ACTIVE=미삭제, DELETED=삭제됨 */
  deletionStatus?: AdminReviewDeletionStatus;
  /** 작성일 시작 (YYYY-MM-DD) */
  startDate?: string;
  /** 작성일 종료 (YYYY-MM-DD). startDate 없이 단독 전달 불가 */
  endDate?: string;
  /** 작성일 정렬. 미전달 시 BE 기본값 DESC */
  sort?: AdminListSortDirection;
  page?: number;
  pageSize?: number;
}

/** 목록 페이지네이션 */
export interface AdminReviewPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** GET /api/admin/reviews 목록 아이템 */
export interface AdminReviewListItem {
  id: number;
  userId: string;
  quoteId: number;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  /** soft delete 시각. 미삭제이면 null */
  deletedAt: string | null;
  author: AdminReviewAuthor;
  /** Quote.moverId가 없으면 null */
  mover: AdminReviewMover | null;
}

/** 목록 조회 성공 시 data 필드 */
export interface AdminReviewListData {
  items: AdminReviewListItem[];
  pagination: AdminReviewPagination;
}

/** GET /api/admin/reviews 성공 응답 */
export interface AdminReviewListResponse {
  data: AdminReviewListData;
}
