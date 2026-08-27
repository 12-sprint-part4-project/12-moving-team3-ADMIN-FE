import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminReportList } from '@/hooks/useAdminReportList';
import { reportListItem } from '@/test/adminReportFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminReportList } = vi.hoisted(() => ({
  mockGetAdminReportList: vi.fn(),
}));

vi.mock('@/services/adminReportApi', () => ({
  getAdminReportList: mockGetAdminReportList,
}));

const listResponse = {
  data: {
    items: [reportListItem()],
    pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
  },
};

describe('useAdminReportList', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminReportList.mockReset();
    mockGetAdminReportList.mockResolvedValue(listResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('params로 getAdminReportList를 호출한다', async () => {
    const params = { page: 2, pageSize: 10, status: 'PENDING' as const };

    renderHook(() => useAdminReportList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportList).toHaveBeenCalledWith(params);
    });
  });

  it('params 없이 getAdminReportList를 호출한다', async () => {
    renderHook(() => useAdminReportList(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportList).toHaveBeenCalledWith(undefined);
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(
      () => useAdminReportList({ page: 1, pageSize: 10 }, { enabled: false }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReportList).not.toHaveBeenCalled();
    });
  });

  it('기본 enabled는 true다', async () => {
    renderHook(() => useAdminReportList({ page: 1, pageSize: 10 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportList).toHaveBeenCalledTimes(1);
    });
  });

  it('page·필터 변경 시 새로운 query를 호출한다', async () => {
    const firstParams = { page: 1, pageSize: 10 };
    const secondParams = { page: 2, pageSize: 10, userName: '홍길동' };

    const { rerender } = renderHook(
      ({ params }) => useAdminReportList(params),
      {
        initialProps: { params: firstParams },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReportList).toHaveBeenCalledWith(firstParams);
    });

    rerender({ params: secondParams });

    await waitFor(() => {
      expect(mockGetAdminReportList).toHaveBeenCalledWith(secondParams);
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(
      () => useAdminReportList({ page: 1, pageSize: 10 }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(listResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminReportList.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(
      () => useAdminReportList({ page: 1, pageSize: 10 }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 실패 요청을 반복하지 않는다', async () => {
    mockGetAdminReportList.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminReportList({ page: 1, pageSize: 10 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReportList).toHaveBeenCalledTimes(1);
    });
  });
});
