import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Access Token 재발급 후 원래 요청을 이미 한 번 재시도했는지 표시 */
    _retry?: boolean;
  }
}
