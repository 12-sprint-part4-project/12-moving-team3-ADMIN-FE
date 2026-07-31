/**
 * 관리자 인증 관련 타입.
 * 백엔드 Swagger(AdminLoginRequest/AdminLoginResponse/AdminRefreshResponse)와
 * controller 응답(`{ data: ... }`) 구조에 맞춘다.
 */

/** POST /api/admin/auth/login 요청 Body */
export interface AdminLoginRequest {
  email: string;
  password: string;
}

/** 로그인 응답에 포함되는 관리자 정보 */
export interface AdminAuthAdmin {
  id: number;
  email: string;
  name: string;
}

/** 로그인 성공 시 data 필드 */
export interface AdminLoginData {
  accessToken: string;
  admin: AdminAuthAdmin;
}

/** POST /api/admin/auth/login 성공 응답 */
export interface AdminLoginResponse {
  data: AdminLoginData;
}

/** 토큰 재발급 성공 시 data 필드 (accessToken만 포함) */
export interface AdminRefreshData {
  accessToken: string;
}

/** POST /api/admin/auth/refresh 성공 응답 */
export interface AdminRefreshResponse {
  data: AdminRefreshData;
}
