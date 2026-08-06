/** 관리자 신고 관리 API 경로. URL 비교·API 호출에서 공통으로 사용한다. */
export const ADMIN_REPORT_LIST_PATH = '/api/admin/reports';

/** GET /api/admin/reports/:reportId */
export const getAdminReportDetailPath = (reportId: number) =>
  `/api/admin/reports/${reportId}`;
