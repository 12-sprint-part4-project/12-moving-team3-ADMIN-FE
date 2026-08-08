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
