import {
  ADMIN_REPORT_LIST_PATH,
  ADMIN_REPORT_STATISTICS_PATH,
  getAdminReportDetailPath,
  getAdminReportRejectPath,
  getAdminReportResolvePath,
} from '@/api/adminReportPaths';
import { axiosInstance } from '@/api/axiosInstance';

import type {
  AdminReportDetailResponse,
  AdminReportListQuery,
  AdminReportListResponse,
  AdminReportRejectResponse,
  AdminReportResolveBody,
  AdminReportResolveResponse,
  AdminReportStatisticsQuery,
  AdminReportStatisticsResponse,
} from '@/types/adminReport';

/**
 * 관리자 신고 목록 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 * status·target·id·userName·reportedFrom·reportedTo는
 * 값이 있을 때만 params에 포함한다(axios가 undefined를 제외한다).
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
 * 관리자 신고 통계 조회.
 * params가 없으면 전체 기간을 집계한다.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminReportStatistics = async (
  params?: AdminReportStatisticsQuery
): Promise<AdminReportStatisticsResponse> => {
  const response = await axiosInstance.get<AdminReportStatisticsResponse>(
    ADMIN_REPORT_STATISTICS_PATH,
    params ? { params } : undefined
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

/**
 * 관리자 신고 처리(resolve).
 * actions는 AdminReportProcessAction 타입으로 한곳에서만 정의한다.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const resolveAdminReport = async (
  reportId: number,
  body: AdminReportResolveBody
): Promise<AdminReportResolveResponse> => {
  const response = await axiosInstance.post<AdminReportResolveResponse>(
    getAdminReportResolvePath(reportId),
    body
  );

  return response.data;
};

/**
 * 관리자 신고 반려(reject).
 * 요청 body는 없다 — 조치 없이 상태만 REJECTED로 바꾼다.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const rejectAdminReport = async (
  reportId: number
): Promise<AdminReportRejectResponse> => {
  const response = await axiosInstance.post<AdminReportRejectResponse>(
    getAdminReportRejectPath(reportId)
  );

  return response.data;
};
