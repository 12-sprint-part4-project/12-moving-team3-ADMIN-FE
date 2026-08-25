import {
  ADMIN_MEMBER_LIST_PATH,
  getAdminMemberActivatePath,
  getAdminMemberDetailPath,
  getAdminMemberSuspendPath,
} from '@/api/adminMemberPaths';
import { axiosInstance } from '@/api/axiosInstance';

import type {
  AdminMemberDetailQuery,
  AdminMemberDetailResponse,
  AdminMemberListQuery,
  AdminMemberListResponse,
  AdminMemberStatusChangeResponse,
} from '@/types/adminMember';

/**
 * 관리자 회원 목록 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminMemberList = async (
  params?: AdminMemberListQuery
): Promise<AdminMemberListResponse> => {
  const response = await axiosInstance.get<AdminMemberListResponse>(
    ADMIN_MEMBER_LIST_PATH,
    { params }
  );

  return response.data;
};

/**
 * 관리자 회원 상세 조회.
 * params는 목록과 동일한 필터·정렬이며 page/pageSize는 보내지 않는다.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminMemberDetail = async (
  memberId: string,
  params?: AdminMemberDetailQuery
): Promise<AdminMemberDetailResponse> => {
  const response = await axiosInstance.get<AdminMemberDetailResponse>(
    getAdminMemberDetailPath(memberId),
    params ? { params } : undefined
  );

  return response.data;
};

/**
 * 관리자 회원 계정 정지.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const suspendAdminMember = async (
  memberId: string
): Promise<AdminMemberStatusChangeResponse> => {
  const response = await axiosInstance.patch<AdminMemberStatusChangeResponse>(
    getAdminMemberSuspendPath(memberId)
  );

  return response.data;
};

/**
 * 관리자 회원 계정 활성화.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const activateAdminMember = async (
  memberId: string
): Promise<AdminMemberStatusChangeResponse> => {
  const response = await axiosInstance.patch<AdminMemberStatusChangeResponse>(
    getAdminMemberActivatePath(memberId)
  );

  return response.data;
};
