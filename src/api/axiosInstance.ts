import axios, { type InternalAxiosRequestConfig } from 'axios';

import {
  ADMIN_AUTH_LOGIN_PATH,
  ADMIN_AUTH_REFRESH_PATH,
} from '@/api/adminAuthPaths';
import {
  clearAdminAccessToken,
  getAdminAccessToken,
  setAdminAccessToken,
} from '@/lib/adminAccessToken';

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
 * - 401 시 Response Interceptor가 refresh 후 원래 요청을 한 번 재시도한다.
 */
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

const isAdminAuthExemptPath = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  // login/refresh 자체의 401에는 자동 재발급을 시도하지 않아 무한 루프를 막는다.
  return (
    url.includes(ADMIN_AUTH_LOGIN_PATH) ||
    url.includes(ADMIN_AUTH_REFRESH_PATH)
  );
};

const redirectToLogin = (): void => {
  // SSR에서는 window가 없으므로 브라우저에서만 이동한다.
  if (typeof window === 'undefined') {
    return;
  }

  window.location.assign('/login');
};

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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // 401만 대상. 이미 재시도했거나 login/refresh 경로는 재발급하지 않는다.
    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAdminAuthExemptPath(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // 원래 요청은 한 번만 재시도한다.
    originalRequest._retry = true;

    try {
      // 순환 참조 방지를 위해 동적 import로 refreshAdminAccessToken을 호출한다.
      const { refreshAdminAccessToken } = await import('@/api/adminAuthApi');
      const refreshResponse = await refreshAdminAccessToken();
      // BE 응답: { data: { accessToken } }
      const newAccessToken = refreshResponse.data.accessToken;

      setAdminAccessToken(newAccessToken);
      // 재시도 시에는 기존 Authorization이 있어도 새 토큰으로 교체한다.
      originalRequest.headers.set(
        'Authorization',
        `Bearer ${newAccessToken}`
      );

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      clearAdminAccessToken();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  }
);
