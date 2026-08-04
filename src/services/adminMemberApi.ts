import { axiosInstance } from '@/api/axiosInstance';
import {
  ADMIN_MEMBER_LIST_PATH,
  getAdminMemberActivatePath,
  getAdminMemberDetailPath,
  getAdminMemberSuspendPath,
} from '@/api/adminMemberPaths';
import type {
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
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminMemberDetail = async (
  memberId: string
): Promise<AdminMemberDetailResponse> => {
  const response = await axiosInstance.get<AdminMemberDetailResponse>(
    getAdminMemberDetailPath(memberId)
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
