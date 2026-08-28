import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminReviewDetail } from '@/hooks/useAdminReviewDetail';
import { activeReviewDetail } from '@/test/adminReviewFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminReviewDetail } = vi.hoisted(() => ({
  mockGetAdminReviewDetail: vi.fn(),
}));

vi.mock('@/services/adminReviewApi', () => ({
  getAdminReviewDetail: mockGetAdminReviewDetail,
}));

const detailResponse = { data: activeReviewDetail() };
const reviewId = 10;

describe('useAdminReviewDetail', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminReviewDetail.mockReset();
    mockGetAdminReviewDetail.mockResolvedValue(detailResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('reviewId가 있으면 API를 호출한다', async () => {
    renderHook(() => useAdminReviewDetail(reviewId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).toHaveBeenCalledWith(
        reviewId,
        undefined
      );
    });
  });

  it('undefined reviewId면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminReviewDetail(undefined), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).not.toHaveBeenCalled();
    });
  });

  it('null reviewId면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminReviewDetail(null), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).not.toHaveBeenCalled();
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminReviewDetail(reviewId, { enabled: false }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).not.toHaveBeenCalled();
    });
  });

  it('detail query를 전달한다', async () => {
    const query = { userName: '홍길동', sort: 'ASC' as const };

    renderHook(() => useAdminReviewDetail(reviewId, { query }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).toHaveBeenCalledWith(reviewId, query);
    });
  });

  it('reviewId 변경 시 새 요청을 호출한다', async () => {
    const { rerender } = renderHook(({ id }) => useAdminReviewDetail(id), {
      initialProps: { id: reviewId },
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).toHaveBeenCalledWith(
        reviewId,
        undefined
      );
    });

    rerender({ id: 11 });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).toHaveBeenCalledWith(11, undefined);
    });
  });

  it('query 변경 시 새 요청을 호출한다', async () => {
    const firstQuery = { sort: 'DESC' as const };
    const secondQuery = { sort: 'ASC' as const };

    const { rerender } = renderHook(
      ({ query }) => useAdminReviewDetail(reviewId, { query }),
      {
        initialProps: { query: firstQuery },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).toHaveBeenCalledWith(
        reviewId,
        firstQuery
      );
    });

    rerender({ query: secondQuery });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).toHaveBeenCalledWith(
        reviewId,
        secondQuery
      );
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(() => useAdminReviewDetail(reviewId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(detailResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminReviewDetail.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAdminReviewDetail(reviewId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 실패 요청을 반복하지 않는다', async () => {
    mockGetAdminReviewDetail.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminReviewDetail(reviewId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminReviewDetail).toHaveBeenCalledTimes(1);
    });
  });
});
