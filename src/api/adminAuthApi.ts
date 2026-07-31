import { axiosInstance } from '@/api/axiosInstance';
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
    '/api/admin/auth/login',
    body
  );

  return response.data;
};

/**
 * 관리자 Access Token 재발급.
 * Refresh Token은 httpOnly 쿠키로 전달되므로 Body에 넣지 않는다.
 * axiosInstance의 withCredentials: true가 쿠키 전송을 담당한다.
 */
export const refreshAdminAccessToken = async (): Promise<AdminRefreshResponse> => {
  const response = await axiosInstance.post<AdminRefreshResponse>(
    '/api/admin/auth/refresh'
  );

  return response.data;
};
