import { axiosInstance } from '@/api/axiosInstance';
import {
  ADMIN_AUTH_LOGIN_PATH,
  ADMIN_AUTH_LOGOUT_PATH,
  ADMIN_AUTH_ME_PATH,
  ADMIN_AUTH_REFRESH_PATH,
} from '@/api/adminAuthPaths';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminLogoutResponse,
  AdminMeResponse,
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
    // Refresh Token은 httpOnly 쿠키이므로 credentials 포함이 필수다.
    // 인스턴스 기본값과 동일하지만, 인증 복구 경로임을 명시한다.
    const response = await axiosInstance.post<AdminRefreshResponse>(
      ADMIN_AUTH_REFRESH_PATH,
      undefined,
      { withCredentials: true }
    );

    return response.data;
  };

/**
 * 현재 로그인한 관리자 인증 정보 조회.
 * Access Token은 axiosInstance Request Interceptor가 Authorization에 첨부한다.
 */
export const getAdminMe = async (): Promise<AdminMeResponse> => {
  const response = await axiosInstance.get<AdminMeResponse>(ADMIN_AUTH_ME_PATH);

  return response.data;
};

/**
 * 관리자 로그아웃.
 * Refresh Token은 httpOnly 쿠키로 전달되므로 Body에 넣지 않는다.
 * Access Token 인증은 필요하지 않다(쿠키 기준으로 세션을 정리한다).
 */
export const logoutAdmin = async (): Promise<AdminLogoutResponse> => {
  const response = await axiosInstance.post<AdminLogoutResponse>(
    ADMIN_AUTH_LOGOUT_PATH
  );

  return response.data;
};
