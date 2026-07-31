import axios from 'axios';

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
 * - Access Token 첨부·인터셉터는 이후 단계에서 추가한다.
 */
export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
