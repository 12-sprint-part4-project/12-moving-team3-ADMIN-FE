import { useTranslation } from 'react-i18next';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';

import {
  formatNullableDateTime,
  getTargetPresenceStatus,
  TARGET_PRESENCE_BADGE_VARIANT,
  type TargetPresenceStatus,
} from './helpers';
import { ReportProcessActionToggle } from './ReportProcessActionToggle';
import { TargetUserProfileImage } from './TargetUserProfileImage';

import type {
  AdminReportDetail,
  AdminReportDetailTargetUser,
  AdminReportDetailUserSummary,
} from '@/types/adminReport';

/** 처리용 targetUser 계정 상태 — ACTIVE=정상, SUSPENDED=정지됨 */
const AccountStatusBadge = ({
  targetUser,
}: {
  targetUser: AdminReportDetailTargetUser;
}) => {
  const { t } = useTranslation();
  const isActive = targetUser.status === 'ACTIVE';

  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-gray-500">
        {t('reports.fields.accountStatus')}
      </dt>
      <dd>
        <StatusBadge
          variant={isActive ? 'success' : 'danger'}
          label={t(
            isActive ? 'reports.account.active' : 'reports.account.suspended'
          )}
        />
      </dd>
    </div>
  );
};

interface PresenceStatusFieldsProps {
  presenceStatus: TargetPresenceStatus;
  deletedAt: string | null;
}

const PresenceStatusFields = ({
  presenceStatus,
  deletedAt,
}: PresenceStatusFieldsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <dt className="shrink-0 text-gray-500">
          {t('reports.fields.targetStatus')}
        </dt>
        <dd>
          <StatusBadge
            variant={TARGET_PRESENCE_BADGE_VARIANT[presenceStatus]}
            label={t(`reports.presence.${presenceStatus}`)}
          />
        </dd>
      </div>
      {/* soft-delete 원본 조회 — 삭제 여부와 무관하게 필드를 항상 노출한다. */}
      <DetailField
        label={t('reports.fields.deletedAt')}
        value={formatNullableDateTime(deletedAt)}
      />
    </>
  );
};

interface AccountInfoFieldsProps {
  targetUser: AdminReportDetailTargetUser;
}

const AccountInfoFields = ({ targetUser }: AccountInfoFieldsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <AccountStatusBadge targetUser={targetUser} />
      <DetailField
        label={t('reports.fields.reportCount')}
        value={String(targetUser.reportCount)}
      />
    </>
  );
};

interface TargetMemberInfoFieldsProps {
  summaryUser: AdminReportDetailUserSummary;
  targetUser: AdminReportDetailTargetUser | null;
  presenceStatus: TargetPresenceStatus;
}

/**
 * 신고 대상 회원 공통 필드.
 * USER·콘텐츠 신고가 같은 레이아웃을 쓰며, 이름·닉네임·이미지는 targetUser를 우선한다.
 * 이메일·유저 타입·삭제일은 상세 요약(user)에만 있어 보조로 쓴다.
 */
const TargetMemberInfoFields = ({
  summaryUser,
  targetUser,
  presenceStatus,
}: TargetMemberInfoFieldsProps) => {
  const { t } = useTranslation();
  const displayName = targetUser?.name ?? summaryUser.name;
  const displayNickname = targetUser?.nickname ?? summaryUser.nickname;
  const profileImageUser = {
    id: targetUser?.id ?? summaryUser.id,
    name: displayName,
    nickname: displayNickname,
    profileImageKey:
      targetUser?.profileImageKey ?? summaryUser.profileImageKey ?? null,
  };

  return (
    <div className="flex items-start gap-3">
      <TargetUserProfileImage
        key={profileImageUser.profileImageKey ?? profileImageUser.id}
        user={profileImageUser}
      />
      {/*
        상태도 이 dl 안에 둬 아바타 옆 라벨 열과 정렬을 맞춘다.
        전체 너비로 빼면 라벨이 아바타 아래로 밀려 깨져 보인다.
      */}
      <dl className="flex min-w-0 flex-1 flex-col gap-2 text-md-medium">
        <DetailField label={t('reports.fields.name')} value={displayName} />
        <DetailField
          label={t('reports.fields.nickname')}
          value={displayNickname}
        />
        <DetailField
          label={t('reports.fields.email')}
          value={summaryUser.email}
        />
        <DetailField
          label={t('reports.fields.userType')}
          value={t(`reports.userType.${summaryUser.userType}`)}
        />
        <PresenceStatusFields
          presenceStatus={presenceStatus}
          deletedAt={summaryUser.deletedAt}
        />
        {targetUser ? <AccountInfoFields targetUser={targetUser} /> : null}
      </dl>
    </div>
  );
};

export interface ReportTargetInfoSectionProps {
  detail: AdminReportDetail;
  /** SUSPEND_TARGET_USER 선택 여부. 상위(ReportDetailContent)에서 관리한다. */
  isSuspendSelected: boolean;
  onToggleSuspend: () => void;
}

/**
 * 신고 대상 정보.
 * 대상 타입/ID는 기본 정보에 있으므로 여기서는 상태·작성자(·회원 공통 필드)만 둔다.
 * USER 신고도 콘텐츠 신고와 같은 회원 정보 UI를 쓰고, 프로필 상세는 콘텐츠 섹션에 둔다.
 * 정지 Action 노출은 availableActions.canSuspendUser만 본다(대상별 규칙 재계산 없음).
 */
export const ReportTargetInfoSection = ({
  detail,
  isSuspendSelected,
  onToggleSuspend,
}: ReportTargetInfoSectionProps) => {
  const { t } = useTranslation();
  const { targetInfo, category, availableActions, status, targetUser } = detail;
  const summaryUser = targetInfo.user;
  const presenceStatus = getTargetPresenceStatus(targetInfo);
  const presenceHint =
    presenceStatus === 'active'
      ? null
      : t(`reports.presenceHint.${presenceStatus}`);
  // 프로필 신고인데 대상이 회원이 아니면 이상 케이스 — 콘텐츠 대신 짧은 경고만 둔다.
  const isUnexpectedProfileTarget =
    category === 'INAPPROPRIATE_PROFILE' && detail.target !== 'USER';

  // 대상 섹션은 계정(작성자) 삭제일만 본다. 콘텐츠 삭제는 content 섹션에서 표시한다.
  const deletedAt = summaryUser?.deletedAt ?? null;
  // BE가 허용할 때만 버튼을 그린다. 삭제·미존재·비PENDING은 canSuspendUser=false다.
  const canSuspendUser = availableActions?.canSuspendUser === true;
  // 방어적 가드: availableActions와 어긋나도 PENDING이 아니면 선택하지 못하게 한다.
  const isSuspendDisabled = status !== 'PENDING';

  return (
    <DetailSection title={t('reports.detail.targetInfo')}>
      <div className="flex flex-col gap-3">
        {isUnexpectedProfileTarget ? (
          <p className="text-md-regular text-gray-500">
            {t('reports.detail.unexpectedProfileTarget')}
          </p>
        ) : null}
        {summaryUser ? (
          <TargetMemberInfoFields
            summaryUser={summaryUser}
            targetUser={targetUser}
            presenceStatus={presenceStatus}
          />
        ) : (
          <dl className="flex flex-col gap-2 text-md-medium">
            <PresenceStatusFields
              presenceStatus={presenceStatus}
              deletedAt={deletedAt}
            />
            {targetUser ? <AccountInfoFields targetUser={targetUser} /> : null}
          </dl>
        )}
        {presenceHint ? (
          <p className="text-md-regular text-gray-500">{presenceHint}</p>
        ) : null}
        {canSuspendUser ? (
          <ReportProcessActionToggle
            label={t('reports.action.SUSPEND_TARGET_USER')}
            selected={isSuspendSelected}
            disabled={isSuspendDisabled}
            disabledReason={
              isSuspendDisabled ? t('reports.detail.suspendDisabled') : null
            }
            onToggle={onToggleSuspend}
          />
        ) : null}
      </div>
    </DetailSection>
  );
};
