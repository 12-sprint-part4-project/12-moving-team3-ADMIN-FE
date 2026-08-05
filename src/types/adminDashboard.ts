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

/** GET /api/admin/dashboard/charts/request-trend period */
export type AdminDashboardRequestTrendPeriod = 'DAY' | 'WEEK' | 'MONTH';

/** GET /api/admin/dashboard/charts/request-trend 쿼리 파라미터 */
export interface AdminDashboardRequestTrendQuery {
  period: AdminDashboardRequestTrendPeriod;
}

/** 견적 요청 추이 데이터 포인트 */
export interface AdminDashboardRequestTrendItem {
  /** 기간에 따른 시간 또는 날짜 레이블 */
  label: string;
  /** 해당 구간에 제출된 견적 요청 수 */
  count: number;
}

/** GET /api/admin/dashboard/charts/request-trend 성공 응답 */
export interface AdminDashboardRequestTrendResponse {
  data: AdminDashboardRequestTrendItem[];
}

/** GET /api/admin/dashboard/charts/request-status 성공 시 data 필드 */
export interface AdminDashboardRequestStatus {
  total: number;
  submitted: number;
  confirmed: number;
  completed: number;
  expired: number;
  canceled: number;
}

/** GET /api/admin/dashboard/charts/request-status 성공 응답 */
export interface AdminDashboardRequestStatusResponse {
  data: AdminDashboardRequestStatus;
}
