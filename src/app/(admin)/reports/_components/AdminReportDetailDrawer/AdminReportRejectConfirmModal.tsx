'use client';

import { useTranslation } from 'react-i18next';

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
}: AdminReportRejectConfirmModalProps) => {
  const { t } = useTranslation();
  return (
    <ConfirmModal
      open={open}
      title={t('reports.reject.title')}
      description={t('reports.reject.description')}
      confirmText={t('reports.reject.confirm')}
      cancelText={t('common.cancel')}
      confirmLoading={isPending}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
};
