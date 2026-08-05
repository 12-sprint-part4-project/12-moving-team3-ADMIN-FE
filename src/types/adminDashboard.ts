/**
 * 관리자 대시보드 API 타입.
 * 백엔드 controller 응답(`{ data: ... }`) 구조에 맞춘다.
 */

/** GET /api/admin/dashboard/statistics 쿼리 파라미터 */
export interface AdminDashboardStatisticsQuery {
  /** 조회 기간 시작일 (YYYY-MM-DD). 없으면 전체 기간 */
  startDate?: string;
  /** 조회 기간 종료일 (YYYY-MM-DD) */
  endDate?: string;
}

/** GET /api/admin/dashboard/statistics 성공 시 data 필드 */
export interface AdminDashboardStatistics {
  userCount: number;
  estimateRequestCount: number;
  quoteCount: number;
  completedEstimateRequestCount: number;
  pendingReportCount: number;
}

/** GET /api/admin/dashboard/statistics 성공 응답 */
export interface AdminDashboardStatisticsResponse {
  data: AdminDashboardStatistics;
}
