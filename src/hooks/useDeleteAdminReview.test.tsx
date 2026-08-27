import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ADMIN_REVIEW_QUERY_KEYS } from '@/constants/adminReviewQueryKeys';
import { useDeleteAdminReview } from '@/hooks/useDeleteAdminReview';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockDeleteAdminReview } = vi.hoisted(() => ({
  mockDeleteAdminReview: vi.fn(),
}));

vi.mock('@/services/adminReviewApi', () => ({
  deleteAdminReview: mockDeleteAdminReview,
}));

const reviewId = 10;

describe('useDeleteAdminReview', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockDeleteAdminReview.mockReset();
    mockDeleteAdminReview.mockResolvedValue(undefined);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('reviewId를 deleteAdminReview에 전달한다', async () => {
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reviewId);

    expect(mockDeleteAdminReview.mock.calls[0]?.[0]).toBe(reviewId);
  });

  it('성공 결과를 반환한다', async () => {
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    const response = await result.current.mutateAsync(reviewId);

    expect(response).toBeUndefined();
  });

  it('실패 결과를 반환한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(result.current.mutateAsync(reviewId)).rejects.toThrow(
      'delete failed'
    );
  });

  it('성공 후 ADMIN_REVIEW_QUERY_KEYS.lists()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reviewId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_REVIEW_QUERY_KEYS.lists(),
      });
    });
  });

  it('성공 후 ADMIN_REVIEW_QUERY_KEYS.statisticses()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reviewId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_REVIEW_QUERY_KEYS.statisticses(),
      });
    });
  });

  it('성공 후 ADMIN_REVIEW_QUERY_KEYS.details()를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reviewId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ADMIN_REVIEW_QUERY_KEYS.details(),
      });
    });
  });

  it('성공 시 정확히 3개의 prefix를 무효화한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await result.current.mutateAsync(reviewId);

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledTimes(3);
    });
  });

  it('실패 시 캐시를 무효화하지 않는다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteAdminReview(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await expect(result.current.mutateAsync(reviewId)).rejects.toThrow(
      'delete failed'
    );

    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
