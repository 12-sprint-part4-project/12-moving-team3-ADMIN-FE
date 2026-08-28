import { useCallback, useState } from 'react';

import { useDeleteAdminReview } from '@/hooks/useDeleteAdminReview';

const DELETE_ERROR_MESSAGE =
  '리뷰 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.';

/**
 * 리뷰 삭제 ConfirmModal 상태와 mutation 연결.
 * 선택 → 확인 → DELETE → 성공 시 모달 닫기 / 실패 시 모달 유지.
 */
export const useAdminReviewDeleteConfirm = () => {
  // ConfirmModal 대상. null이면 모달이 닫힌다.
  const [pendingReviewId, setPendingReviewId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteAdminReview();
  const isDeletePending = deleteMutation.isPending;

  const handleRequestDelete = useCallback((reviewId: number) => {
    setDeleteError(null);
    setPendingReviewId(reviewId);
  }, []);

  const handleCancelDelete = () => {
    // 요청 중에는 취소·ESC·오버레이로 모달을 닫지 않아 중복 조작을 막는다.
    if (isDeletePending) {
      return;
    }

    setPendingReviewId(null);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (pendingReviewId == null || isDeletePending) {
      return false;
    }

    // 재시도 시 이전 실패 문구를 먼저 지운다.
    setDeleteError(null);

    try {
      await deleteMutation.mutateAsync(pendingReviewId);
      // 성공 시 모달만 닫는다. 목록·통계는 mutation onSuccess에서 invalidate한다.
      setPendingReviewId(null);
      return true;
    } catch {
      // 실패 시 모달을 유지해 재시도·취소를 가능하게 한다.
      setDeleteError(DELETE_ERROR_MESSAGE);
      return false;
    }
  };

  return {
    pendingReviewId,
    deleteError,
    isDeletePending,
    handleRequestDelete,
    handleCancelDelete,
    handleConfirmDelete,
  };
};
