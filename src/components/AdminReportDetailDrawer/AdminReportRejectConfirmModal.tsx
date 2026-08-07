'use client';

import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';

export interface AdminReportRejectConfirmModalProps {
  open: boolean;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 신고 반려 확인 Modal.
 * API·mutation은 호출하지 않고, 반려 안내와 확인/취소만 담당한다.
 */
export const AdminReportRejectConfirmModal = ({
  open,
  isPending,
  onClose,
  onConfirm,
}: AdminReportRejectConfirmModalProps) => (
  <ConfirmModal
    open={open}
    title="신고를 반려하시겠습니까?"
    description="반려 시 사용자나 콘텐츠에 별도의 조치를 하지 않습니다. 신고 상태만 반려로 변경됩니다."
    confirmText="신고 반려 확인"
    cancelText="취소"
    confirmLoading={isPending}
    onConfirm={onConfirm}
    onCancel={onClose}
  />
);
