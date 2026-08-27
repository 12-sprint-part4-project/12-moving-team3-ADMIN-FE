import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';
import { useAdminReviewStatistics } from '@/hooks/useAdminReviewStatistics';
import { reviewStatistics } from '@/test/adminReviewFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminReviewStatistics } = vi.hoisted(() => ({
  mockGetAdminReviewStatistics: vi.fn(),
}));

vi.mock('@/services/adminReviewApi', () => ({
  getAdminReviewStatistics: mockGetAdminReviewStatistics,
}));

const statisticsResponse = { data: reviewStatistics() };

describe('useAdminReviewStatistics', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminReviewStatistics.mockReset();
    mockGetAdminReviewStatistics.mockResolvedValue(statisticsResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('params 없이 전체 통계를 조회한다', async () => {
    renderHook(() => useAdminReviewStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewStatistics).toHaveBeenCalledWith(undefined);
    });
  });

  it('날짜 query를 전달한다', async () => {
    const params = { startDate: '2026-08-01', endDate: '2026-08-31' };

    renderHook(() => useAdminReviewStatistics(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewStatistics).toHaveBeenCalledWith(params);
    });
  });

  it('query 변경 시 새 요청을 호출한다', async () => {
    const firstParams = { startDate: '2026-08-01' };
    const secondParams = { startDate: '2026-09-01' };

    const { rerender } = renderHook(
      ({ params }) => useAdminReviewStatistics(params),
      {
        initialProps: { params: firstParams },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReviewStatistics).toHaveBeenCalledWith(firstParams);
    });

    rerender({ params: secondParams });

    await waitFor(() => {
      expect(mockGetAdminReviewStatistics).toHaveBeenCalledWith(secondParams);
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(() => useAdminReviewStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(statisticsResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminReviewStatistics.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAdminReviewStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 실패 요청을 반복하지 않는다', async () => {
    mockGetAdminReviewStatistics.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminReviewStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewStatistics).toHaveBeenCalledTimes(1);
    });
  });

  it('staleTime이 3분으로 설정된다', async () => {
    const { result } = renderHook(() => useAdminReviewStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const cachedQuery = queryClient
      .getQueryCache()
      .find({ queryKey: ADMIN_REVIEW_QUERY_KEYS.statistics() });

    expect(cachedQuery?.options.staleTime).toBe(1000 * 60 * 3);
  });
});
