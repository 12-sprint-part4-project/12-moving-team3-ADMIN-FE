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

/** 목록 작성자·기사 요약 — BE AdminReviewUserSummaryDto와 동일 */
export type AdminReviewUserType = 'CUSTOMER' | 'MOVER';

export interface AdminReviewUserSummary {
  id: string;
  name: string;
  nickname: string;
  email: string;
  userType: AdminReviewUserType;
}

/**
 * 관리자 리뷰 목록 아이템.
 * API 연동 TODO에서 응답 스키마와 맞춰 확장할 수 있다.
 */
export interface AdminReviewListItem {
  id: number;
  userId: string;
  quoteId: number;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  author: AdminReviewUserSummary;
  /** Quote.moverId가 없으면 null */
  mover: AdminReviewUserSummary | null;
}
