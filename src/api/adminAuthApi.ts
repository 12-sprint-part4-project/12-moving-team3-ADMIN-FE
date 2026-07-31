import { axiosInstance } from '@/api/axiosInstance';
import {
  ADMIN_AUTH_LOGIN_PATH,
  ADMIN_AUTH_REFRESH_PATH,
} from '@/api/adminAuthPaths';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminRefreshResponse,
} from '@/types/adminAuth';

/** 관리자 로그인. Refresh Token은 Set-Cookie로만 전달된다. */
export const loginAdmin = async (
  body: AdminLoginRequest
): Promise<AdminLoginResponse> => {
  const response = await axiosInstance.post<AdminLoginResponse>(
    ADMIN_AUTH_LOGIN_PATH,
    body
  );

  return response.data;
};

/**
 * 관리자 Access Token 재발급.
 * Refresh Token은 httpOnly 쿠키로 전달되므로 Body에 넣지 않는다.
 * axiosInstance의 withCredentials: true가 쿠키 전송을 담당한다.
 */
export const refreshAdminAccessToken =
  async (): Promise<AdminRefreshResponse> => {
    const response = await axiosInstance.post<AdminRefreshResponse>(
      ADMIN_AUTH_REFRESH_PATH
    );

    return response.data;
  };
