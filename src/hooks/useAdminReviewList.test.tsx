import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminReviewList } from '@/hooks/useAdminReviewList';
import { reviewListItem } from '@/test/adminReviewFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminReviewList } = vi.hoisted(() => ({
  mockGetAdminReviewList: vi.fn(),
}));

vi.mock('@/services/adminReviewApi', () => ({
  getAdminReviewList: mockGetAdminReviewList,
}));

const listResponse = {
  data: {
    items: [reviewListItem()],
    pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
  },
};

describe('useAdminReviewList', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminReviewList.mockReset();
    mockGetAdminReviewList.mockResolvedValue(listResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('params로 getAdminReviewList를 호출한다', async () => {
    const params = { page: 2, pageSize: 10, rating: 5 };

    renderHook(() => useAdminReviewList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewList).toHaveBeenCalledWith(params);
    });
  });

  it('params 없이 getAdminReviewList를 호출한다', async () => {
    renderHook(() => useAdminReviewList(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewList).toHaveBeenCalledWith(undefined);
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(
      () => useAdminReviewList({ page: 1, pageSize: 10 }, { enabled: false }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReviewList).not.toHaveBeenCalled();
    });
  });

  it('기본 enabled는 true다', async () => {
    renderHook(() => useAdminReviewList({ page: 1, pageSize: 10 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewList).toHaveBeenCalledTimes(1);
    });
  });

  it('page·필터 변경 시 새로운 query를 호출한다', async () => {
    const firstParams = { page: 1, pageSize: 10 };
    const secondParams = { page: 2, pageSize: 10, userName: '홍길동' };

    const { rerender } = renderHook(
      ({ params }) => useAdminReviewList(params),
      {
        initialProps: { params: firstParams },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReviewList).toHaveBeenCalledWith(firstParams);
    });

    rerender({ params: secondParams });

    await waitFor(() => {
      expect(mockGetAdminReviewList).toHaveBeenCalledWith(secondParams);
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(
      () => useAdminReviewList({ page: 1, pageSize: 10 }),
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
    mockGetAdminReviewList.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(
      () => useAdminReviewList({ page: 1, pageSize: 10 }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 실패 요청을 반복하지 않는다', async () => {
    mockGetAdminReviewList.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminReviewList({ page: 1, pageSize: 10 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewList).toHaveBeenCalledTimes(1);
    });
  });
});
