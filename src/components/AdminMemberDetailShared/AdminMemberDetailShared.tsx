'use client';

import { useState, type ReactNode } from 'react';

import { Button } from '@/components/Button/Button';
import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminMemberDetail } from '@/hooks/useAdminMemberDetail';
import {
  useActivateAdminMember,
  useSuspendAdminMember,
} from '@/hooks/useAdminMemberStatusMutation';
import { cn } from '@/lib/utils';
import {
  formatAdminMemberJoinedAt,
  formatAdminMemberPhoneNumber,
} from '@/utils/adminMember';

import type {
  AdminMemberDetail,
  MemberMoveType,
  MemberRegion,
  MemberStatus,
} from '@/types/adminMember';

/** 상세 Drawer 상태 변경 액션. ConfirmModal·mutation 연결에 사용한다. */
export type AdminMemberStatusChangeAction = 'suspend' | 'activate';

/** ConfirmModal 액션별 문구. */
interface StatusActionModalCopy {
  title: string;
  description: string;
  confirmText: string;
}

/** ConfirmModal 문구. 액션별로 title/description/confirmText를 분리한다. */
const STATUS_ACTION_MODAL_COPY: Record<
  AdminMemberStatusChangeAction,
  StatusActionModalCopy
> = {
  suspend: {
    title: '회원을 7일 정지하시겠습니까?',
    description: '정지 기간 동안 해당 회원은 서비스 이용이 제한됩니다.',
    confirmText: '7일 정지',
  },
  activate: {
    title: '회원 계정을 활성화하시겠습니까?',
    description: '활성화 후 해당 회원은 다시 서비스를 이용할 수 있습니다.',
    confirmText: '계정 활성화',
  },
};

const STATUS_CHANGE_ERROR_MESSAGE =
  '상태 변경에 실패했습니다. 잠시 후 다시 시도해 주세요.';

export const REGION_LABEL: Record<MemberRegion, string> = {
  SEOUL: '서울',
  GYEONGGI: '경기',
  INCHEON: '인천',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  SEJONG: '세종',
  DAEJEON: '대전',
  JEONBUK: '전북',
  GWANGJU_JEONNAM: '광주·전남',
  GYEONGBUK: '경북',
  DAEGU: '대구',
  ULSAN: '울산',
  GYEONGNAM: '경남',
  BUSAN: '부산',
  JEJU: '제주',
};

export const MOVE_TYPE_LABEL: Record<MemberMoveType, string> = {
  SMALL: '소형 이사',
  HOME: '가정 이사',
  OFFICE: '사무실 이사',
};

export const formatNullableDateTime = (iso: string | null) => {
  if (!iso) {
    return '-';
  }

  return formatAdminMemberJoinedAt(iso);
};

export const formatRegion = (region: MemberRegion | null) => {
  if (!region) {
    return '-';
  }

  return REGION_LABEL[region] ?? region;
};

export const formatServices = (services: MemberMoveType[]) => {
  if (services.length === 0) {
    return '-';
  }

  return services
    .map((service) => MOVE_TYPE_LABEL[service] ?? service)
    .join(', ');
};

export interface DetailFieldProps {
  label: string;
  value: string | number;
  className?: string;
}

/** DetailSection 안 dl 행 */
export const DetailField = ({ label, value, className }: DetailFieldProps) => (
  <div className={cn('flex min-w-0 justify-between gap-4', className)}>
    <dt className="shrink-0 text-gray-500">{label}</dt>
    <dd className="min-w-0 flex-1 break-all text-right text-black-400">
      {value}
    </dd>
  </div>
);

export interface AdminMemberBasicInfoSectionProps {
  detail: AdminMemberDetail;
  className?: string;
}

/** 회원/기사 공통 기본 정보 */
export const AdminMemberBasicInfoSection = ({
  detail,
  className,
}: AdminMemberBasicInfoSectionProps) => (
  <DetailSection title="기본 정보" className={className}>
    <dl className="flex flex-col gap-2 text-md-medium">
      <DetailField label="이름" value={detail.name} />
      <DetailField label="닉네임" value={detail.nickname} />
      <DetailField label="이메일" value={detail.email} />
      <DetailField
        label="전화번호"
        value={formatAdminMemberPhoneNumber(detail.phoneNumber)}
      />
      <DetailField
        label="가입일"
        value={formatAdminMemberJoinedAt(detail.createdAt)}
      />
    </dl>
  </DetailSection>
);

export interface AdminMemberAccountStatusSectionProps {
  detail: AdminMemberDetail;
  className?: string;
}

/** 회원/기사 공통 계정 상태 */
export const AdminMemberAccountStatusSection = ({
  detail,
  className,
}: AdminMemberAccountStatusSectionProps) => {
  // UserStatusInfo가 없으면 목록과 같이 ACTIVE로 표시한다.
  const status = detail.userStatus?.status ?? 'ACTIVE';
  const suspendedAt = detail.userStatus?.suspendedAt ?? null;
  const suspendedUntil = detail.userStatus?.suspendedUntil ?? null;

  return (
    <DetailSection title="계정 상태" className={className}>
      <dl className="flex flex-col gap-2 text-md-medium">
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-500">계정 상태</dt>
          <dd>
            <StatusBadge
              variant={status === 'ACTIVE' ? 'success' : 'danger'}
              label={status === 'ACTIVE' ? '활성' : '정지'}
            />
          </dd>
        </div>
        <DetailField
          label="정지 시작일"
          value={formatNullableDateTime(suspendedAt)}
        />
        <DetailField
          label="정지 종료일"
          value={formatNullableDateTime(suspendedUntil)}
        />
        <DetailField label="신고 횟수" value={detail.reportCount} />
      </dl>
    </DetailSection>
  );
};

export interface AdminMemberStatusActionFooterProps {
  status: MemberStatus;
  /** ConfirmModal을 열기 위한 액션 요청. */
  onRequestStatusChange: (action: AdminMemberStatusChangeAction) => void;
}

/**
 * 계정 상태에 따라 정지 또는 활성화 버튼 하나만 표시한다.
 * ACTIVE → 7일 정지(danger), SUSPENDED → 계정 활성화(solid)
 */
export const AdminMemberStatusActionFooter = ({
  status,
  onRequestStatusChange,
}: AdminMemberStatusActionFooterProps) => {
  if (status === 'ACTIVE') {
    return (
      <Button
        variant="danger"
        className="w-full"
        onClick={() => onRequestStatusChange('suspend')}
      >
        7일 정지
      </Button>
    );
  }

  return (
    <Button
      variant="solid"
      className="w-full"
      onClick={() => onRequestStatusChange('activate')}
    >
      계정 활성화
    </Button>
  );
};

export interface AdminMemberDetailDrawerShellProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
  title: string;
  errorTitle: string;
  emptyTitle: string;
  renderContent: (detail: AdminMemberDetail) => ReactNode;
}

/**
 * 회원/기사 상세 Drawer 공통 셸.
 * 조회·로딩·에러·빈 상태를 담당하고, 본문만 renderContent로 주입한다.
 * footer 액션 → ConfirmModal → 상태 변경 mutation → 목록/상세 갱신까지 연결한다.
 */
export const AdminMemberDetailDrawerShell = ({
  memberId,
  open,
  onClose,
  title,
  errorTitle,
  emptyTitle,
  renderContent,
}: AdminMemberDetailDrawerShellProps) => {
  const [pendingAction, setPendingAction] =
    useState<AdminMemberStatusChangeAction | null>(null);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(
    null
  );

  const { data, isPending, isError, isSuccess } = useAdminMemberDetail(
    memberId,
    { enabled: open && Boolean(memberId) }
  );
  const suspendMutation = useSuspendAdminMember();
  const activateMutation = useActivateAdminMember();

  const detail = data?.data;
  // UserStatusInfo가 없으면 목록·계정 상태 섹션과 같이 ACTIVE로 간주한다.
  const status = detail?.userStatus?.status ?? 'ACTIVE';
  const isStatusChangePending =
    suspendMutation.isPending || activateMutation.isPending;
  const modalCopy = pendingAction
    ? STATUS_ACTION_MODAL_COPY[pendingAction]
    : null;

  const handleCloseDrawer = () => {
    setPendingAction(null);
    setStatusChangeError(null);
    onClose();
  };

  const handleRequestStatusChange = (
    action: AdminMemberStatusChangeAction
  ) => {
    setStatusChangeError(null);
    setPendingAction(action);
  };

  const handleCancelStatusChange = () => {
    // 요청 중에는 취소·ESC·오버레이로 모달을 닫지 않아 중복 조작을 막는다.
    if (isStatusChangePending) {
      return;
    }

    setPendingAction(null);
    setStatusChangeError(null);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingAction || !memberId || isStatusChangePending) {
      return;
    }

    // 재시도 시 이전 실패 문구를 먼저 지운다.
    setStatusChangeError(null);

    try {
      if (pendingAction === 'suspend') {
        await suspendMutation.mutateAsync(memberId);
      } else {
        await activateMutation.mutateAsync(memberId);
      }

      // 성공 시 모달만 닫고 Drawer는 유지한다. 목록·상세는 mutation onSuccess에서 invalidate한다.
      setPendingAction(null);
    } catch {
      // 실패 시 모달을 유지해 재시도·취소를 가능하게 한다.
      setStatusChangeError(STATUS_CHANGE_ERROR_MESSAGE);
    }
  };

  const renderBody = () => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={errorTitle}
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (!isSuccess || !detail) {
      return (
        <EmptyState
          title={emptyTitle}
          description="선택한 회원을 찾을 수 없습니다."
        />
      );
    }

    return renderContent(detail);
  };

  // 상세가 있을 때만 footer를 내려 로딩·에러·빈 상태에서는 액션을 숨긴다.
  const footer =
    isSuccess && detail ? (
      <AdminMemberStatusActionFooter
        status={status}
        onRequestStatusChange={handleRequestStatusChange}
      />
    ) : undefined;

  return (
    <>
      <DetailDrawer
        open={open}
        title={title}
        onClose={handleCloseDrawer}
        footer={footer}
        disableKeyboardEvents={pendingAction !== null}
      >
        {renderBody()}
      </DetailDrawer>

      {modalCopy ? (
        <ConfirmModal
          open={pendingAction != null}
          title={modalCopy.title}
          description={modalCopy.description}
          confirmText={modalCopy.confirmText}
          confirmLoading={isStatusChangePending}
          errorMessage={statusChangeError ?? undefined}
          onConfirm={() => {
            void handleConfirmStatusChange();
          }}
          onCancel={handleCancelStatusChange}
        />
      ) : null}
    </>
  );
};
