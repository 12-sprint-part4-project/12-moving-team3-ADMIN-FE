'use client';

import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button/Button';
import { ConfirmModal } from '@/components/ConfirmModal/ConfirmModal';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailNavigation } from '@/components/DetailNavigation/DetailNavigation';
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
import { isDetailNeighborId } from '@/utils/detailNavigation';

import type {
  AdminMemberDetail,
  AdminMemberDetailQuery,
  MemberMoveType,
  MemberRegion,
  MemberStatus,
} from '@/types/adminMember';
import type { TFunction } from 'i18next';

/** 상세 Drawer 상태 변경 액션. ConfirmModal·mutation 연결에 사용한다. */
export type AdminMemberStatusChangeAction = 'suspend' | 'activate';

/** ConfirmModal 액션별 문구. */
interface StatusActionModalCopy {
  title: string;
  description: string;
  confirmText: string;
}

/** ConfirmModal 문구. 액션별로 title/description/confirmText를 분리한다. */
const getStatusActionModalCopy = (
  action: AdminMemberStatusChangeAction,
  t: TFunction
): StatusActionModalCopy => ({
  title: t(`members.action.${action}.title`),
  description: t(`members.action.${action}.description`),
  confirmText: t(`members.action.${action}.confirm`),
});

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

export const formatNullableDateTime = (iso: string | null, locale: string) => {
  if (!iso) {
    return '-';
  }

  return formatAdminMemberJoinedAt(iso, locale);
};

export const formatRegion = (region: MemberRegion | null, t?: TFunction) => {
  if (!region) {
    return '-';
  }

  return t ? t(`members.region.${region}`) : (REGION_LABEL[region] ?? region);
};

export const formatServices = (services: MemberMoveType[], t?: TFunction) => {
  if (services.length === 0) {
    return '-';
  }

  return services
    .map((service) =>
      t
        ? t(`members.moveType.${service}`)
        : (MOVE_TYPE_LABEL[service] ?? service)
    )
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
}: AdminMemberBasicInfoSectionProps) => {
  const { t, i18n } = useTranslation();
  return (
    <DetailSection title={t('members.detail.basicInfo')} className={className}>
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField label={t('members.fields.name')} value={detail.name} />
        <DetailField
          label={t('members.fields.nickname')}
          value={detail.nickname}
        />
        <DetailField label={t('members.fields.email')} value={detail.email} />
        <DetailField
          label={t('members.fields.phone')}
          value={formatAdminMemberPhoneNumber(detail.phoneNumber)}
        />
        <DetailField
          label={t('members.fields.joinedAt')}
          value={formatAdminMemberJoinedAt(
            detail.createdAt,
            i18n.resolvedLanguage ?? 'ko'
          )}
        />
      </dl>
    </DetailSection>
  );
};

export interface AdminMemberAccountStatusSectionProps {
  detail: AdminMemberDetail;
  className?: string;
}

/** 회원/기사 공통 계정 상태 */
export const AdminMemberAccountStatusSection = ({
  detail,
  className,
}: AdminMemberAccountStatusSectionProps) => {
  const { t, i18n } = useTranslation();
  // UserStatusInfo가 없으면 목록과 같이 ACTIVE로 표시한다.
  const status = detail.userStatus?.status ?? 'ACTIVE';
  const suspendedAt = detail.userStatus?.suspendedAt ?? null;
  const suspendedUntil = detail.userStatus?.suspendedUntil ?? null;

  return (
    <DetailSection
      title={t('members.detail.accountStatus')}
      className={className}
    >
      <dl className="flex flex-col gap-2 text-md-medium">
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-500">
            {t('members.detail.accountStatus')}
          </dt>
          <dd>
            <StatusBadge
              variant={status === 'ACTIVE' ? 'success' : 'danger'}
              label={t(
                status === 'ACTIVE'
                  ? 'members.status.active'
                  : 'members.status.suspended'
              )}
            />
          </dd>
        </div>
        <DetailField
          label={t('members.fields.suspendedAt')}
          value={formatNullableDateTime(
            suspendedAt,
            i18n.resolvedLanguage ?? 'ko'
          )}
        />
        <DetailField
          label={t('members.fields.suspendedUntil')}
          value={formatNullableDateTime(
            suspendedUntil,
            i18n.resolvedLanguage ?? 'ko'
          )}
        />
        <DetailField
          label={t('members.fields.reportCount')}
          value={detail.reportCount}
        />
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
  const { t } = useTranslation();
  if (status === 'ACTIVE') {
    return (
      <Button
        variant="danger"
        className="w-full"
        onClick={() => onRequestStatusChange('suspend')}
      >
        {t('members.action.suspend.confirm')}
      </Button>
    );
  }

  return (
    <Button
      variant="solid"
      className="w-full"
      onClick={() => onRequestStatusChange('activate')}
    >
      {t('members.action.activate.confirm')}
    </Button>
  );
};

export interface AdminMemberDetailDrawerShellProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
  /** 목록과 동일한 필터·정렬. prevId/nextId 계산에 넘긴다. */
  detailQuery: AdminMemberDetailQuery;
  onNavigate: (memberId: string) => void;
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
  detailQuery,
  onNavigate,
  title,
  errorTitle,
  emptyTitle,
  renderContent,
}: AdminMemberDetailDrawerShellProps) => {
  const { t } = useTranslation();
  const [pendingAction, setPendingAction] =
    useState<AdminMemberStatusChangeAction | null>(null);
  const [statusChangeError, setStatusChangeError] = useState<string | null>(
    null
  );

  const { data, isPending, isError, isSuccess } = useAdminMemberDetail(
    memberId,
    {
      query: detailQuery,
      enabled: open && Boolean(memberId),
    }
  );
  const suspendMutation = useSuspendAdminMember();
  const activateMutation = useActivateAdminMember();

  const detail = data?.data;
  // UserStatusInfo가 없으면 목록·계정 상태 섹션과 같이 ACTIVE로 간주한다.
  const status = detail?.userStatus?.status ?? 'ACTIVE';
  const isStatusChangePending =
    suspendMutation.isPending || activateMutation.isPending;
  const modalCopy = pendingAction
    ? getStatusActionModalCopy(pendingAction, t)
    : null;

  const handleCloseDrawer = () => {
    setPendingAction(null);
    setStatusChangeError(null);
    onClose();
  };

  const handleRequestStatusChange = (action: AdminMemberStatusChangeAction) => {
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
      setStatusChangeError(t('members.action.error'));
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
          description={t('members.common.retry')}
        />
      );
    }

    if (!isSuccess || !detail) {
      return (
        <EmptyState
          title={emptyTitle}
          description={t('members.detail.notFoundDescription')}
        />
      );
    }

    return renderContent(detail);
  };

  const handleNavigate = (id: string) => {
    if (!isDetailNeighborId(id, detail ?? null)) {
      return;
    }

    onNavigate(id);
  };

  const navigation =
    memberId != null ? (
      <DetailNavigation
        prevId={detail?.prevId ?? null}
        nextId={detail?.nextId ?? null}
        previousLabel={t('members.detail.previous')}
        nextLabel={t('members.detail.next')}
        disabled={detail == null}
        onNavigate={handleNavigate}
      />
    ) : null;

  const actionFooter =
    isSuccess && detail ? (
      <AdminMemberStatusActionFooter
        status={status}
        onRequestStatusChange={handleRequestStatusChange}
      />
    ) : null;

  const footer =
    navigation || actionFooter ? (
      <>
        {actionFooter}
        {navigation}
      </>
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
