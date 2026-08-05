import {
  ADMIN_REPORT_LIST_PATH,
  getAdminReportDetailPath,
} from '@/api/adminReportPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type {
  AdminReportDetailResponse,
  AdminReportListQuery,
  AdminReportListResponse,
} from '@/types/adminReport';

/**
 * 관리자 신고 목록 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * status·target은 전체가 아닐 때만 params에 포함한다(axios가 undefined를 제외한다).
 */
export const getAdminReportList = async (
  params?: AdminReportListQuery
): Promise<AdminReportListResponse> => {
  const response = await axiosInstance.get<AdminReportListResponse>(
    ADMIN_REPORT_LIST_PATH,
    { params }
  );

  return response.data;
};

/**
 * 관리자 신고 상세 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminReportDetail = async (
  reportId: number
): Promise<AdminReportDetailResponse> => {
  const response = await axiosInstance.get<AdminReportDetailResponse>(
    getAdminReportDetailPath(reportId)
  );

  return response.data;
};
