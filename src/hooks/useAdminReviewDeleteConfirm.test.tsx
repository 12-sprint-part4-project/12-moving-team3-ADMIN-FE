import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminReviewDeleteConfirm } from '@/hooks/useAdminReviewDeleteConfirm';
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
const DELETE_ERROR_MESSAGE =
  '리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.';

describe('useAdminReviewDeleteConfirm', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockDeleteAdminReview.mockReset();
    mockDeleteAdminReview.mockResolvedValue(undefined);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const renderConfirm = () =>
    renderHook(() => useAdminReviewDeleteConfirm(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

  it('초기 pendingReviewId는 null이다', () => {
    const { result } = renderConfirm();

    expect(result.current.pendingReviewId).toBeNull();
  });

  it('초기 error는 없다', () => {
    const { result } = renderConfirm();

    expect(result.current.deleteError).toBeNull();
  });

  it('초기 pending 상태를 전달한다', () => {
    const { result } = renderConfirm();

    expect(result.current.isDeletePending).toBe(false);
  });

  it('handleRequestDelete로 대상 reviewId를 선택한다', () => {
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    expect(result.current.pendingReviewId).toBe(reviewId);
  });

  it('새 삭제 요청 시 이전 error를 초기화한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.deleteError).toBe(DELETE_ERROR_MESSAGE);

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    expect(result.current.deleteError).toBeNull();
  });

  it('다른 reviewId 선택 시 대상을 교체한다', () => {
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    act(() => {
      result.current.handleRequestDelete(11);
    });

    expect(result.current.pendingReviewId).toBe(11);
  });

  it('요청 전 취소 시 modal 상태를 초기화한다', () => {
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    act(() => {
      result.current.handleCancelDelete();
    });

    expect(result.current.pendingReviewId).toBeNull();
  });

  it('pending 중에는 취소를 차단한다', async () => {
    let resolveDelete: (() => void) | undefined;
    mockDeleteAdminReview.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
    );

    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    let confirmPromise: Promise<boolean>;
    act(() => {
      confirmPromise = result.current.handleConfirmDelete();
    });

    await waitFor(() => {
      expect(result.current.isDeletePending).toBe(true);
    });

    act(() => {
      result.current.handleCancelDelete();
    });

    expect(result.current.pendingReviewId).toBe(reviewId);

    resolveDelete?.();
    await act(async () => {
      await confirmPromise;
    });
  });

  it('취소 시 error를 초기화한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    act(() => {
      result.current.handleCancelDelete();
    });

    expect(result.current.deleteError).toBeNull();
  });

  it('확인 성공 시 대상 reviewId로 mutateAsync를 호출한다', async () => {
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(mockDeleteAdminReview.mock.calls[0]?.[0]).toBe(reviewId);
  });

  it('확인 성공 시 true를 반환한다', async () => {
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    let confirmed = false;
    await act(async () => {
      confirmed = await result.current.handleConfirmDelete();
    });

    expect(confirmed).toBe(true);
  });

  it('확인 성공 시 pendingReviewId를 초기화한다', async () => {
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.pendingReviewId).toBeNull();
  });

  it('확인 실패 시 false를 반환한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    let confirmed = true;
    await act(async () => {
      confirmed = await result.current.handleConfirmDelete();
    });

    expect(confirmed).toBe(false);
  });

  it('확인 실패 시 modal을 유지한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.pendingReviewId).toBe(reviewId);
  });

  it('확인 실패 시 고정된 삭제 실패 메시지를 표시한다', async () => {
    mockDeleteAdminReview.mockRejectedValue(new Error('delete failed'));
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.deleteError).toBe(DELETE_ERROR_MESSAGE);
  });

  it('재시도 시 이전 오류를 먼저 제거한다', async () => {
    mockDeleteAdminReview.mockRejectedValueOnce(new Error('delete failed'));
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    mockDeleteAdminReview.mockResolvedValue(undefined);

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    expect(result.current.deleteError).toBeNull();
  });

  it('재시도 성공이 가능하다', async () => {
    mockDeleteAdminReview.mockRejectedValueOnce(new Error('delete failed'));
    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    await act(async () => {
      await result.current.handleConfirmDelete();
    });

    mockDeleteAdminReview.mockResolvedValue(undefined);

    let confirmed = false;
    await act(async () => {
      confirmed = await result.current.handleConfirmDelete();
    });

    expect(confirmed).toBe(true);
    expect(result.current.pendingReviewId).toBeNull();
  });

  it('선택된 reviewId가 없으면 mutation을 호출하지 않는다', async () => {
    const { result } = renderConfirm();

    let confirmed = true;
    await act(async () => {
      confirmed = await result.current.handleConfirmDelete();
    });

    expect(mockDeleteAdminReview).not.toHaveBeenCalled();
    expect(confirmed).toBe(false);
  });

  it('pending 중 중복 확인을 차단한다', async () => {
    let resolveDelete: (() => void) | undefined;
    mockDeleteAdminReview.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        })
    );

    const { result } = renderConfirm();

    act(() => {
      result.current.handleRequestDelete(reviewId);
    });

    let firstConfirm: Promise<boolean>;
    act(() => {
      firstConfirm = result.current.handleConfirmDelete();
    });

    await waitFor(() => {
      expect(result.current.isDeletePending).toBe(true);
    });

    let secondResult = true;
    await act(async () => {
      secondResult = await result.current.handleConfirmDelete();
    });

    expect(secondResult).toBe(false);
    expect(mockDeleteAdminReview).toHaveBeenCalledTimes(1);

    resolveDelete?.();
    await act(async () => {
      await firstConfirm;
    });
  });
});
