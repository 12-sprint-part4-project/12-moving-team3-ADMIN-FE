import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// axiosInstance 모듈 로드 전에 API base URL을 설정한다.
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
  // fake timer가 다른 테스트 파일에 누수되면 userEvent·waitFor가 hang된다.
  vi.useRealTimers();
  vi.clearAllTimers();
  window.history.replaceState(null, '', '/');
});
