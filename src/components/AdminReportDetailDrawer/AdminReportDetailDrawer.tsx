'use client';

import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import {
  useRejectAdminReport,
  useResolveAdminReport,
} from '@/hooks/useAdminReportDecisionMutation';
import { useAdminReportDetail } from '@/hooks/useAdminReportDetail';
import type {
  AdminReportDetail,
  AdminReportProcessAction,
} from '@/types/adminReport';

import { AdminReportDecisionSuccessToast } from './AdminReportDecisionSuccessToast';
import { AdminReportRejectConfirmModal } from './AdminReportRejectConfirmModal';
import { AdminReportResolveConfirmModal } from './AdminReportResolveConfirmModal';
import {
  getAdminReportDecisionErrorMessage,
  getDetailErrorTitle,
  toggleReportProcessAction,
} from './helpers';
import { ReportBasicInfoSection } from './ReportBasicInfoSection';
import { ReportContentSection } from './ReportContentSection';
import { ReportReporterSection } from './ReportReporterSection';
import { ReportTargetInfoSection } from './ReportTargetInfoSection';

export interface AdminReportDetailDrawerProps {
  open: boolean;
  /** 목록에서 선택한 신고 ID. null이면 상세 요청을 하지 않는다. */
  reportId: number | null;
  onClose: () => void;
}

type DecisionModal = 'resolve' | 'reject';

const SUCCESS_TOAST_DURATION_MS = 3000;

/**
 * 카테고리별 검토 우선순위에 맞춰 섹션 순서를 조정한다.
 * - 욕설/비방·일반: 콘텐츠 → 대상 → 신고자
 * - 부적절한 프로필(USER): 콘텐츠(reportedContent 프로필) → 대상 → 신고자
 * - 부적절한 프로필(비 USER): 대상 → 신고자 (콘텐츠 섹션 없음)
 */
const ReportDetailSections = ({
  detail,
  selectedActions,
  onToggleAction,
}: {
  detail: AdminReportDetail;
  selectedActions: AdminReportProcessAction[];
  onToggleAction: (action: AdminReportProcessAction) => void;
}) => {
  const isInappropriateProfile = detail.category === 'INAPPROPRIATE_PROFILE';
  const showContentSection =
    !isInappropriateProfile || detail.target === 'USER';

  return (
    <div className="flex flex-col gap-4">
      <ReportBasicInfoSection detail={detail} />
      {showContentSection ? (
        <ReportContentSection
          detail={detail}
          isDeleteContentSelected={selectedActions.includes(
            'DELETE_REPORTED_CONTENT'
          )}
          onToggleDeleteContent={() =>
            onToggleAction('DELETE_REPORTED_CONTENT')
          }
        />
      ) : null}
      <ReportTargetInfoSection
        detail={detail}
        isSuspendSelected={selectedActions.includes('SUSPEND_TARGET_USER')}
        onToggleSuspend={() => onToggleAction('SUSPEND_TARGET_USER')}
      />
      <ReportReporterSection detail={detail} />
    </div>
  );
};

/**
 * 단일 DetailDrawer 안에서 로딩·에러·상세·처리/반려를 모두 처리한다.
 * 신고 선택이 바뀌면 부모 key로 리마운트해 Action·Modal 상태를 초기화한다.
 * 상세 조회 완료나 캐시 갱신만으로는 key가 바뀌지 않아 Drawer가 다시 열리지 않는다.
 */
const ReportDetailDrawerChrome = ({
  open,
  reportId,
  detail,
  isPending,
  isError,
  error,
  onClose,
  onRetry,
}: {
  open: boolean;
  reportId: number | null;
  detail: AdminReportDetail | null;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onClose: () => void;
  onRetry: () => void;
}) => {
  const [selectedActions, setSelectedActions] = useState<
    AdminReportProcessAction[]
  >([]);
  const [activeModal, setActiveModal] = useState<DecisionModal | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resolveMutation = useResolveAdminReport();
  const rejectMutation = useRejectAdminReport();

  const isDecisionPending =
    resolveMutation.isPending || rejectMutation.isPending;
  const isReportPending = detail?.status === 'PENDING';
  const hasSelectedActions = selectedActions.length > 0;

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    window.setTimeout(() => {
      setSuccessMessage(null);
    }, SUCCESS_TOAST_DURATION_MS);
  };

  const handleToggleAction = (action: AdminReportProcessAction) => {
    // 요청 중에는 선택을 바꿔 확인 Modal 내용과 요청 body가 어긋나지 않게 한다.
    if (isDecisionPending) {
      return;
    }

    setSelectedActions((prev) => toggleReportProcessAction(prev, action));
  };

  const handleCloseDrawer = () => {
    // Modal·에러 로컬 상태를 먼저 비우고, 부모 selectedReportId를 null로 초기화한다.
    setActiveModal(null);
    setDecisionError(null);
    onClose();
  };

  const handleOpenResolveModal = () => {
    if (!isReportPending || !hasSelectedActions || isDecisionPending) {
      return;
    }

    setDecisionError(null);
    setActiveModal('resolve');
  };

  const handleOpenRejectModal = () => {
    if (!isReportPending || isDecisionPending) {
      return;
    }

    setDecisionError(null);
    setActiveModal('reject');
  };

  const handleCloseModal = () => {
    // 요청 중에는 ESC·오버레이·취소로 닫지 않아 중복 조작을 막는다.
    if (isDecisionPending) {
      return;
    }

    setActiveModal(null);
    setDecisionError(null);
  };

  const handleConfirmResolve = async () => {
    if (
      !detail ||
      !isReportPending ||
      !hasSelectedActions ||
      isDecisionPending ||
      activeModal !== 'resolve'
    ) {
      return;
    }

    setDecisionError(null);

    try {
      await resolveMutation.mutateAsync({
        reportId: detail.id,
        body: { actions: selectedActions },
      });

      setActiveModal(null);
      setSelectedActions([]);
      showSuccessToast('신고를 처리했습니다.');
    } catch (error) {
      // 실패 시 Modal·선택 Action을 유지해 재시도할 수 있게 한다. 캐시는 mutation onSuccess에서만 갱신된다.
      setDecisionError(getAdminReportDecisionErrorMessage(error));
    }
  };

  const handleConfirmReject = async () => {
    if (
      !detail ||
      !isReportPending ||
      isDecisionPending ||
      activeModal !== 'reject'
    ) {
      return;
    }

    setDecisionError(null);

    try {
      await rejectMutation.mutateAsync(detail.id);

      setActiveModal(null);
      setSelectedActions([]);
      showSuccessToast('신고를 반려했습니다.');
    } catch (error) {
      setDecisionError(getAdminReportDecisionErrorMessage(error));
    }
  };

  const renderBody = () => {
    if (detail) {
      return (
        <ReportDetailSections
          detail={detail}
          selectedActions={selectedActions}
          onToggleAction={handleToggleAction}
        />
      );
    }

    if (reportId == null) {
      return (
        <p className="text-md-regular text-gray-500">
          선택한 신고 정보가 없습니다.
        </p>
      );
    }

    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={getDetailErrorTitle(error)}
          description="잠시 후 다시 시도해 주세요."
          action={
            <Button variant="secondary" onClick={onRetry}>
              다시 시도
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        title="신고 정보가 없습니다."
        description="선택한 신고를 찾을 수 없습니다."
      />
    );
  };

  // PENDING 상세가 있을 때만 footer를 둔다. 처리·반려 후에는 숨겨 Action 재실행을 막는다.
  const footer =
    detail && isReportPending ? (
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-1"
          disabled={isDecisionPending}
          onClick={handleOpenRejectModal}
        >
          신고 반려
        </Button>
        <Button
          variant="solid"
          className="flex-1"
          disabled={!hasSelectedActions || isDecisionPending}
          onClick={handleOpenResolveModal}
        >
          신고 처리
        </Button>
      </div>
    ) : undefined;

  return (
    <>
      <DetailDrawer
        open={open}
        title="신고 상세"
        onClose={handleCloseDrawer}
        footer={footer}
        disableKeyboardEvents={activeModal !== null}
      >
        {renderBody()}
      </DetailDrawer>

      <AdminReportResolveConfirmModal
        open={activeModal === 'resolve'}
        selectedActions={selectedActions}
        isPending={resolveMutation.isPending}
        errorMessage={
          activeModal === 'resolve' ? (decisionError ?? undefined) : undefined
        }
        onClose={handleCloseModal}
        onConfirm={() => {
          void handleConfirmResolve();
        }}
      />

      <AdminReportRejectConfirmModal
        open={activeModal === 'reject'}
        isPending={rejectMutation.isPending}
        errorMessage={
          activeModal === 'reject' ? (decisionError ?? undefined) : undefined
        }
        onClose={handleCloseModal}
        onConfirm={() => {
          void handleConfirmReject();
        }}
      />

      {successMessage ? (
        <AdminReportDecisionSuccessToast message={successMessage} />
      ) : null}
    </>
  );
};

/**
 * 신고 상세 Drawer.
 * open + reportId일 때 상세 API를 호출하고, 로딩·에러·처리/반려를 Drawer 안에서 처리한다.
 */
export const AdminReportDetailDrawer = ({
  open,
  reportId,
  onClose,
}: AdminReportDetailDrawerProps) => {
  const { data, error, isPending, isError, refetch } = useAdminReportDetail(
    reportId,
    {
      enabled: open && reportId != null,
    }
  );

  // queryKey가 reportId별이라 다른 신고를 열 때 이전 data가 섞이지 않는다.
  const detail = data?.data ?? null;
  // 응답 id가 현재 선택과 다를 때만 막아, 캐시/전환 중 잘못된 상세가 잠깐 보이지 않게 한다.
  const isDetailForSelection =
    detail != null && reportId != null && detail.id === reportId;

  return (
    <ReportDetailDrawerChrome
      // 선택 신고가 바뀔 때만 리마운트한다. 상세 조회 완료·invalidate로는 key가 유지된다.
      key={reportId ?? 'closed'}
      open={open}
      reportId={reportId}
      detail={isDetailForSelection ? detail : null}
      isPending={isPending}
      isError={isError}
      error={error}
      onClose={onClose}
      onRetry={() => {
        void refetch();
      }}
    />
  );
};
