import { axiosInstance } from '@/api/axiosInstance';
import {
  ADMIN_MEMBER_LIST_PATH,
  getAdminMemberDetailPath,
} from '@/api/adminMemberPaths';
import type {
  AdminMemberDetailResponse,
  AdminMemberListQuery,
  AdminMemberListResponse,
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
