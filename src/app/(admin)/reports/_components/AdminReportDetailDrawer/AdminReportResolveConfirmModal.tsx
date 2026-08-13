'use client';

import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';
import type { AdminReportProcessAction } from '@/types/adminReport';
import { ADMIN_REPORT_PROCESS_ACTION_LABEL } from '@/utils/adminReport';

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
  const hasSelectedActions = selectedActions.length > 0;

  return (
    <ConfirmModal
      open={open}
      title="신고를 처리하시겠습니까?"
      description={
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p>선택한 조치</p>
            {hasSelectedActions ? (
              <ul className="list-disc space-y-1 pl-5 text-black-400">
                {selectedActions.map((action) => (
                  <li key={action}>
                    {ADMIN_REPORT_PROCESS_ACTION_LABEL[action]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">선택된 조치가 없습니다.</p>
            )}
          </div>
          <p>처리 결과는 되돌리기 어렵습니다. 신중히 확인해 주세요.</p>
        </div>
      }
      confirmText="신고 처리 확인"
      cancelText="취소"
      confirmLoading={isPending}
      confirmDisabled={!hasSelectedActions}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
};
