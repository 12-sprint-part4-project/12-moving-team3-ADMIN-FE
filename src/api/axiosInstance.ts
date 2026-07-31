import axios, { type InternalAxiosRequestConfig } from 'axios';

import { getAdminAccessToken } from '@/lib/adminAccessToken';

const baseURL = process.env.NEXT_PUBLIC_API_URL;

// baseURL이 없으면 요청이 상대 경로로 나가 원인을 찾기 어렵다. 모듈 로드 시점에 바로 실패시킨다.
if (!baseURL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL is not defined. Set it in .env (e.g. NEXT_PUBLIC_API_URL=http://localhost:8080).'
  );
}

/**
 * 관리자 FE 전용 Axios 인스턴스.
 * - Refresh Token은 httpOnly 쿠키(adminRefreshToken)로 전달되므로 withCredentials가 필요하다.
 * - Access Token은 Request Interceptor가 Authorization 헤더에 자동 첨부한다.
 */
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // 호출측에서 이미 Authorization을 넣은 경우 덮어쓰지 않는다.
    if (config.headers.has('Authorization')) {
      return config;
    }

    const accessToken = getAdminAccessToken();

    // 로그인 직전처럼 토큰이 없으면 헤더를 붙이지 않는다.
    if (!accessToken) {
      return config;
    }

    // Access Token만 Bearer로 첨부한다. Refresh Token은 쿠키로만 전달한다.
    config.headers.set('Authorization', `Bearer ${accessToken}`);

    return config;
  }
);
