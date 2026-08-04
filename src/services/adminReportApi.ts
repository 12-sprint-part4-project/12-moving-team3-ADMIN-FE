import { ADMIN_REPORT_LIST_PATH } from '@/api/adminReportPaths';
import { axiosInstance } from '@/api/axiosInstance';
import type {
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
