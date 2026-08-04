import { ADMIN_REPORT_LIST_PATH } from '@/api/adminReportPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type { AdminReportListResponse } from '@/types/adminReport';

/**
 * 관리자 신고 목록 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * 이번 단계에서는 query parameter를 붙이지 않는다(BE 기본 page/pageSize 사용).
 */
export const getAdminReportList = async (): Promise<AdminReportListResponse> => {
  const response =
    await axiosInstance.get<AdminReportListResponse>(ADMIN_REPORT_LIST_PATH);

  return response.data;
};
