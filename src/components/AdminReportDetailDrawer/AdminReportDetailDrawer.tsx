'use client';

import { useState } from 'react';

import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { useAdminReportDetail } from '@/hooks/useAdminReportDetail';
import type {
  AdminReportDetail,
  AdminReportProcessAction,
} from '@/types/adminReport';

import { getDetailErrorTitle, toggleReportProcessAction } from './helpers';
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

/**
 * 카테고리별 검토 우선순위에 맞춰 섹션 순서를 조정한다.
 * - 욕설/비방: 콘텐츠 → 대상 → 신고자
 * - 부적절한 프로필: 대상 프로필 → 신고자 (콘텐츠 없음)
 * Action 선택은 이후 처리 Modal이 쓸 수 있도록 이 상위 컴포넌트에서 관리한다.
 * 신고가 바뀌면 부모에서 key={detail.id}로 리마운트해 선택을 초기화한다.
 */
const ReportDetailContent = ({ detail }: { detail: AdminReportDetail }) => {
  const isInappropriateProfile = detail.category === 'INAPPROPRIATE_PROFILE';
  const [selectedActions, setSelectedActions] = useState<
    AdminReportProcessAction[]
  >([]);

  const handleToggleAction = (action: AdminReportProcessAction) => {
    setSelectedActions((prev) => toggleReportProcessAction(prev, action));
  };

  return (
    <div className="flex flex-col gap-4">
      <ReportBasicInfoSection detail={detail} />
      {isInappropriateProfile ? (
        <>
          <ReportTargetInfoSection
            detail={detail}
            isSuspendSelected={selectedActions.includes('SUSPEND_TARGET_USER')}
            onToggleSuspend={() => handleToggleAction('SUSPEND_TARGET_USER')}
          />
          <ReportReporterSection detail={detail} />
        </>
      ) : (
        <>
          <ReportContentSection
            detail={detail}
            isDeleteContentSelected={selectedActions.includes(
              'DELETE_REPORTED_CONTENT'
            )}
            onToggleDeleteContent={() =>
              handleToggleAction('DELETE_REPORTED_CONTENT')
            }
          />
          <ReportTargetInfoSection
            detail={detail}
            isSuspendSelected={selectedActions.includes('SUSPEND_TARGET_USER')}
            onToggleSuspend={() => handleToggleAction('SUSPEND_TARGET_USER')}
          />
          <ReportReporterSection detail={detail} />
        </>
      )}
    </div>
  );
};

/**
 * 신고 상세 Drawer.
 * open + reportId일 때 상세 API를 호출하고, 로딩·에러·대상 상태를 Drawer 안에서 처리한다.
 */
export const AdminReportDetailDrawer = ({
  open,
  reportId,
  onClose,
}: AdminReportDetailDrawerProps) => {
  const { data, error, isPending, isError, isSuccess, refetch } =
    useAdminReportDetail(reportId, {
      enabled: open && reportId != null,
    });

  // queryKey가 reportId별이라 다른 신고를 열 때 이전 data가 섞이지 않는다.
  const detail = data?.data ?? null;
  // 응답 id가 현재 선택과 다를 때만 막아, 캐시/전환 중 잘못된 상세가 잠깐 보이지 않게 한다.
  const isDetailForSelection =
    detail != null && reportId != null && detail.id === reportId;

  const renderBody = () => {
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
            <Button variant="secondary" onClick={() => void refetch()}>
              다시 시도
            </Button>
          }
        />
      );
    }

    if (!isSuccess || !isDetailForSelection) {
      return (
        <EmptyState
          title="신고 정보가 없습니다."
          description="선택한 신고를 찾을 수 없습니다."
        />
      );
    }

    // key로 신고별 선택 상태를 분리한다. effect setState 없이 이전 선택을 버린다.
    return <ReportDetailContent key={detail.id} detail={detail} />;
  };

  return (
    <DetailDrawer open={open} title="신고 상세" onClose={onClose}>
      {renderBody()}
    </DetailDrawer>
  );
};
