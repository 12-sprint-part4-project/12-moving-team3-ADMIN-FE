'use client';

import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';

export interface AdminReportRejectConfirmModalProps {
  open: boolean;
  isPending: boolean;
  /** 반려 API 실패 시 ConfirmModal에 표시. 없으면 숨긴다. */
  errorMessage?: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 신고 반려 확인 Modal.
 * 반려 안내·확인/취소를 담당하고, API 호출은 상위(Drawer)에서 한다.
 */
export const AdminReportRejectConfirmModal = ({
  open,
  isPending,
  errorMessage,
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
    errorMessage={errorMessage}
    onConfirm={onConfirm}
    onCancel={onClose}
  />
);
