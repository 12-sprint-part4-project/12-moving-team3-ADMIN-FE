'use client';

import { useTranslation } from 'react-i18next';

import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';

export interface ReviewDeleteConfirmModalProps {
  open: boolean;
  isPending: boolean;
  /** 삭제 API 실패 시 ConfirmModal에 표시. 없으면 숨긴다. */
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 리뷰 삭제 확인 Modal.
 * 안내·확인/취소 UI만 담당하고, API 호출은 상위(ReviewManagementContent)에서 한다.
 */
export const ReviewDeleteConfirmModal = ({
  open,
  isPending,
  errorMessage,
  onConfirm,
  onCancel,
}: ReviewDeleteConfirmModalProps) => {
  const { t } = useTranslation();

  return (
    <ConfirmModal
      open={open}
      title={t('reviews.delete.title')}
      description={t('reviews.delete.description')}
      confirmText={t('reviews.delete.confirm')}
      confirmLoading={isPending}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};
