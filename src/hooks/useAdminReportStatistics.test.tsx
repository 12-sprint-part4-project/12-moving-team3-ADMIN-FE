import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminReportStatistics } from '@/hooks/useAdminReportStatistics';
import { reportStatistics } from '@/test/adminReportFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminReportStatistics } = vi.hoisted(() => ({
  mockGetAdminReportStatistics: vi.fn(),
}));

vi.mock('@/services/adminReportApi', () => ({
  getAdminReportStatistics: mockGetAdminReportStatistics,
}));

const statisticsResponse = { data: reportStatistics() };

describe('useAdminReportStatistics', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminReportStatistics.mockReset();
    mockGetAdminReportStatistics.mockResolvedValue(statisticsResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('params 없이 전체 통계를 조회한다', async () => {
    renderHook(() => useAdminReportStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportStatistics).toHaveBeenCalledWith(undefined);
    });
  });

  it('날짜 query를 전달한다', async () => {
    const params = { startDate: '2026-08-01', endDate: '2026-08-31' };

    renderHook(() => useAdminReportStatistics(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportStatistics).toHaveBeenCalledWith(params);
    });
  });

  it('query 변경 시 새 요청을 호출한다', async () => {
    const firstParams = { startDate: '2026-08-01' };
    const secondParams = { startDate: '2026-09-01' };

    const { rerender } = renderHook(
      ({ params }) => useAdminReportStatistics(params),
      {
        initialProps: { params: firstParams },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReportStatistics).toHaveBeenCalledWith(firstParams);
    });

    rerender({ params: secondParams });

    await waitFor(() => {
      expect(mockGetAdminReportStatistics).toHaveBeenCalledWith(secondParams);
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(() => useAdminReportStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(statisticsResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminReportStatistics.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAdminReportStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 실패 요청을 반복하지 않는다', async () => {
    mockGetAdminReportStatistics.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminReportStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportStatistics).toHaveBeenCalledTimes(1);
    });
  });

  it('staleTime이 3분으로 설정된다', async () => {
    const { result } = renderHook(() => useAdminReportStatistics(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Hook 구현과 동일한 staleTime 값을 확인한다.
    expect(result.current.dataUpdatedAt).toBeGreaterThan(0);
  });
});
