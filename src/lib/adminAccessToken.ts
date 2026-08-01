/**
 * 관리자 Access Token 메모리 저장소.
 * XSS로 스크립트가 읽기 쉬운 localStorage/sessionStorage/document.cookie에는 두지 않는다.
 * Refresh Token은 httpOnly 쿠키로만 다루므로 이 모듈의 대상이 아니다.
 */
let adminAccessToken: string | null = null;

export const setAdminAccessToken = (token: string): void => {
  adminAccessToken = token;
};

export const getAdminAccessToken = (): string | null => adminAccessToken;

export const clearAdminAccessToken = (): void => {
  adminAccessToken = null;
};
