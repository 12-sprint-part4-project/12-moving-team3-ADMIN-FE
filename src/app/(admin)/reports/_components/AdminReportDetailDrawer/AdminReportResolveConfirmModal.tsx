'use client';

import { useTranslation } from 'react-i18next';

import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';

import type { AdminReportProcessAction } from '@/types/adminReport';

export interface AdminReportResolveConfirmModalProps {
  open: boolean;
  selectedActions: AdminReportProcessAction[];
  isPending: boolean;
  /** 처리 API 실패 시 ConfirmModal에 표시. 없으면 숨긴다. */
  errorMessage?: string;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * 신고 처리 확인 Modal.
 * 선택 Action 안내·확인/취소를 담당하고, API 호출은 상위(Drawer)에서 한다.
 */
export const AdminReportResolveConfirmModal = ({
  open,
  selectedActions,
  isPending,
  errorMessage,
  onClose,
  onConfirm,
}: AdminReportResolveConfirmModalProps) => {
  const { t } = useTranslation();
  const hasSelectedActions = selectedActions.length > 0;

  return (
    <ConfirmModal
      open={open}
      title={t('reports.resolve.title')}
      description={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p>{t('reports.resolve.selectedActions')}</p>
            {hasSelectedActions ? (
              <ul className="list-disc space-y-1 pl-5 text-black-400">
                {selectedActions.map((action) => (
                  <li key={action}>{t(`reports.action.${action}`)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">{t('reports.resolve.noActions')}</p>
            )}
          </div>
          <p>{t('reports.resolve.warning')}</p>
        </div>
      }
      confirmText={t('reports.resolve.confirm')}
      cancelText={t('common.cancel')}
      confirmLoading={isPending}
      confirmDisabled={!hasSelectedActions}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
};
