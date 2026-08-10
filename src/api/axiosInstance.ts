import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';

import {
  ADMIN_AUTH_LOGIN_PATH,
  ADMIN_AUTH_LOGOUT_PATH,
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
 *   (login/refresh/logout 경로도 헤더 첨부 대상이다. 토큰이 있을 때만 붙인다.)
 * - 401 시 Response Interceptor가 refresh 후 원래 요청을 한 번 재시도한다.
 * - login/refresh/logout 경로의 401은 재발급 대상에서 제외한다.
 * - 동시 401이어도 refresh는 refreshPromise로 한 번만 호출한다.
 */
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

/** 진행 중인 refresh Promise. 동시 401에서 동일 Promise를 재사용한다. */
let refreshPromise: Promise<string> | null = null;

/** 상대/절대 URL·query string이 있어도 pathname만 비교할 수 있게 정규화한다. */
const getRequestPathname = (url: string): string => {
  try {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return new URL(url).pathname;
    }
  } catch {
    // URL 파싱 실패 시 아래 상대 경로 처리로 넘긴다.
  }

  return url.split('?')[0]?.split('#')[0] ?? '';
};

/**
 * 401 응답 시 Access Token 재발급·원요청 재시도를 하지 않는 인증 경로.
 * - login/refresh: 재발급 루프 방지
 * - logout: 로그아웃 중 refresh 재시도로 세션을 되살리지 않기 위함
 * Authorization 헤더 첨부 여부와는 별개다(첨부는 Request Interceptor가 담당).
 */
const isAdminAuthRefreshRetryExemptPath = (url?: string): boolean => {
  if (!url) {
    return false;
  }

  const pathname = getRequestPathname(url);

  return (
    pathname === ADMIN_AUTH_LOGIN_PATH ||
    pathname === ADMIN_AUTH_REFRESH_PATH ||
    pathname === ADMIN_AUTH_LOGOUT_PATH
  );
};

const redirectToLogin = (): void => {
  // SSR에서는 window가 없으므로 브라우저에서만 이동한다.
  if (typeof window === 'undefined') {
    return;
  }

  // 이미 로그인 페이지면 같은 경로로 다시 이동하지 않는다.
  if (window.location.pathname === '/login') {
    return;
  }

  window.location.assign('/login');
};

/**
 * Access Token 재발급.
 * 이미 진행 중이면 기존 Promise를 재사용해 refresh API 중복 호출을 막는다.
 */
const refreshAccessToken = (): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      // 순환 참조 방지를 위해 동적 import로 refreshAdminAccessToken을 호출한다.
      const { refreshAdminAccessToken } = await import('@/services/adminAuthApi');
      const refreshResponse = await refreshAdminAccessToken();
      // BE 응답: { data: { accessToken } }
      const newAccessToken = refreshResponse.data.accessToken;

      setAdminAccessToken(newAccessToken);
      return newAccessToken;
    })()
      .catch((refreshError: unknown) => {
        // 공유 Promise의 catch에서 한 번만 정리·이동해 중복 redirect를 막는다.
        clearAdminAccessToken();
        redirectToLogin();
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
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

    // 401만 대상. 이미 재시도했거나 login/refresh/logout 경로는 재발급하지 않는다.
    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isAdminAuthRefreshRetryExemptPath(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    // 원래 요청은 한 번만 재시도한다.
    originalRequest._retry = true;

    try {
      const newAccessToken = await refreshAccessToken();
      // headers가 없거나 일반 객체여도 AxiosHeaders로 정규화한 뒤 새 토큰으로 교체한다.
      const headers = AxiosHeaders.from(originalRequest.headers ?? {});
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      originalRequest.headers = headers;

      // React Query 등이 붙인 AbortSignal이 있으면, refresh 성공 후에도
      // 재시도가 canceled로 끝나 인증 복구가 실패할 수 있다.
      // 재시도는 새 요청으로 취급해 signal만 제거한다.
      delete originalRequest.signal;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      // clear/redirect는 공유 refreshPromise에서 이미 처리했다.
      // 원래 401이 아니라 Refresh 실패 원인을 호출자에게 전달한다.
      return Promise.reject(refreshError);
    }
  }
);
