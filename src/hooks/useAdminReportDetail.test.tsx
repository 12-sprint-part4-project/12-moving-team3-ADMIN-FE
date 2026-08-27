import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminReportDetail } from '@/hooks/useAdminReportDetail';
import { reportDetail } from '@/test/adminReportFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminReportDetail } = vi.hoisted(() => ({
  mockGetAdminReportDetail: vi.fn(),
}));

vi.mock('@/services/adminReportApi', () => ({
  getAdminReportDetail: mockGetAdminReportDetail,
}));

const detailResponse = { data: reportDetail() };

describe('useAdminReportDetail', () => {
  let queryClient = createTestQueryClient();
  const reportId = 26;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminReportDetail.mockReset();
    mockGetAdminReportDetail.mockResolvedValue(detailResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('reportId가 있을 때 API를 호출한다', async () => {
    renderHook(() => useAdminReportDetail(reportId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).toHaveBeenCalledWith(
        reportId,
        undefined
      );
    });
  });

  it('reportId가 undefined면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminReportDetail(undefined), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).not.toHaveBeenCalled();
    });
  });

  it('reportId가 null이면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminReportDetail(null), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).not.toHaveBeenCalled();
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminReportDetail(reportId, { enabled: false }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).not.toHaveBeenCalled();
    });
  });

  it('detail query를 전달한다', async () => {
    const query = { status: 'PENDING' as const, sort: 'ASC' as const };

    renderHook(() => useAdminReportDetail(reportId, { query }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).toHaveBeenCalledWith(reportId, query);
    });
  });

  it('reportId 변경 시 새 요청을 호출한다', async () => {
    const { rerender } = renderHook(
      ({ id }: { id: number }) => useAdminReportDetail(id),
      {
        initialProps: { id: 26 },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReportDetail).toHaveBeenCalledWith(26, undefined);
    });

    rerender({ id: 27 });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).toHaveBeenCalledWith(27, undefined);
    });
  });

  it('query 변경 시 새 요청을 호출한다', async () => {
    const firstQuery = { status: 'PENDING' as const };
    const secondQuery = { status: 'RESOLVED' as const };

    const { rerender } = renderHook(
      ({ query }) => useAdminReportDetail(reportId, { query }),
      {
        initialProps: { query: firstQuery },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReportDetail).toHaveBeenCalledWith(
        reportId,
        firstQuery
      );
    });

    rerender({ query: secondQuery });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).toHaveBeenCalledWith(
        reportId,
        secondQuery
      );
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(() => useAdminReportDetail(reportId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(detailResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminReportDetail.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAdminReportDetail(reportId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 실패 요청을 반복하지 않는다', async () => {
    mockGetAdminReportDetail.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminReportDetail(reportId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportDetail).toHaveBeenCalledTimes(1);
    });
  });
});
