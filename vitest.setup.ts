import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// axiosInstance 모듈 로드 전에 API base URL을 설정한다.
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});
