import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminReportDetail,
  AdminReportDetailTargetUser,
} from '@/types/adminReport';
import { ADMIN_REPORT_USER_TYPE_LABEL } from '@/utils/adminReport';

import {
  formatNullableDateTime,
  getTargetPresenceStatus,
  TARGET_PRESENCE_BADGE_VARIANT,
  TARGET_PRESENCE_HINT,
  TARGET_PRESENCE_LABEL,
} from './helpers';
import { ReportProcessActionToggle } from './ReportProcessActionToggle';
import { ReportProfileSection } from './ReportProfileSection';
import { TargetUserProfileImage } from './TargetUserProfileImage';

/** 처리용 targetUser 계정 상태 — ACTIVE=정상, SUSPENDED=정지됨 */
const getAccountStatusBadge = (targetUser: AdminReportDetailTargetUser) => {
  const isActive = targetUser.status === 'ACTIVE';

  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="shrink-0 text-gray-500">계정 상태</dt>
      <dd>
        <StatusBadge
          variant={isActive ? 'success' : 'danger'}
          label={isActive ? '정상' : '정지됨'}
        />
      </dd>
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
 * 대상 타입/ID는 기본 정보에 있으므로 여기서는 상태·작성자(·프로필)만 둔다.
 * 정지 Action 노출은 availableActions.canSuspendUser만 본다(대상별 규칙 재계산 없음).
 */
export const ReportTargetInfoSection = ({
  detail,
  isSuspendSelected,
  onToggleSuspend,
}: ReportTargetInfoSectionProps) => {
  const { targetInfo, category, availableActions, status, targetUser } = detail;
  const summaryUser = targetInfo.user;
  const presenceStatus = getTargetPresenceStatus(targetInfo);
  const presenceHint = TARGET_PRESENCE_HINT[presenceStatus];
  const isInappropriateProfile = category === 'INAPPROPRIATE_PROFILE';
  // 프로필 신고인데 대상이 회원이 아니면 이상 케이스 — 콘텐츠 대신 짧은 경고만 둔다.
  const isUnexpectedProfileTarget =
    isInappropriateProfile && detail.target !== 'USER';

  // 대상 섹션은 계정(작성자) 삭제일만 본다. 콘텐츠 삭제는 content 섹션에서 표시한다.
  const deletedAt = summaryUser?.deletedAt ?? null;
  // BE가 허용할 때만 버튼을 그린다. 삭제·미존재·비PENDING은 canSuspendUser=false다.
  const canSuspendUser = availableActions?.canSuspendUser === true;
  // 방어적 가드: availableActions와 어긋나도 PENDING이 아니면 선택하지 못하게 한다.
  const isSuspendDisabled = status !== 'PENDING';

  // 이미지 key는 처리용 targetUser를 우선하고, 없으면 요약 user의 key를 쓴다.
  const profileImageUser = summaryUser
    ? {
        id: summaryUser.id,
        name: summaryUser.name,
        nickname: summaryUser.nickname,
        profileImageKey:
          targetUser?.profileImageKey ?? summaryUser.profileImageKey,
      }
    : null;

  const presenceStatusFields = (
    <>
      <div className="flex items-center justify-between gap-4">
        <dt className="shrink-0 text-gray-500">대상 상태</dt>
        <dd>
          <StatusBadge
            variant={TARGET_PRESENCE_BADGE_VARIANT[presenceStatus]}
            label={TARGET_PRESENCE_LABEL[presenceStatus]}
          />
        </dd>
      </div>
      {/* soft-delete 원본 조회 — 삭제 여부와 무관하게 필드를 항상 노출한다. */}
      <DetailField label="삭제일" value={formatNullableDateTime(deletedAt)} />
    </>
  );

  const sanctionUserFields = targetUser ? (
    <>
      {getAccountStatusBadge(targetUser)}
      <DetailField label="신고 횟수" value={String(targetUser.reportCount)} />
    </>
  ) : null;

  return (
    <DetailSection
      title={isInappropriateProfile ? '신고 대상 프로필' : '신고 대상 정보'}
    >
      <div className="flex flex-col gap-3">
        {isUnexpectedProfileTarget ? (
          <p className="text-md-regular text-gray-500">
            이 신고는 프로필 유형인데 대상이 회원이 아닙니다. 신고 기본 정보의
            대상 타입·ID를 확인해 주세요.
          </p>
        ) : null}
        {summaryUser && profileImageUser ? (
          <>
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
                <DetailField label="이름" value={summaryUser.name} />
                <DetailField label="닉네임" value={summaryUser.nickname} />
                <DetailField label="이메일" value={summaryUser.email} />
                {!isInappropriateProfile ? (
                  <DetailField
                    label="유저 타입"
                    value={ADMIN_REPORT_USER_TYPE_LABEL[summaryUser.userType]}
                  />
                ) : null}
                {!isInappropriateProfile ? (
                  <>
                    {presenceStatusFields}
                    {sanctionUserFields}
                  </>
                ) : null}
              </dl>
            </div>
            {isInappropriateProfile ? (
              <>
                <ReportProfileSection targetUser={summaryUser} />
                <dl className="flex flex-col gap-2 text-md-medium">
                  {presenceStatusFields}
                  {sanctionUserFields}
                </dl>
              </>
            ) : null}
          </>
        ) : (
          <dl className="flex flex-col gap-2 text-md-medium">
            {presenceStatusFields}
            {sanctionUserFields}
          </dl>
        )}
        {presenceHint ? (
          <p className="text-md-regular text-gray-500">{presenceHint}</p>
        ) : null}
        {canSuspendUser ? (
          <ReportProcessActionToggle
            label="7일 정지"
            selected={isSuspendSelected}
            disabled={isSuspendDisabled}
            disabledReason={
              isSuspendDisabled
                ? '처리 완료·반려된 신고는 정지 Action을 선택할 수 없습니다.'
                : null
            }
            onToggle={onToggleSuspend}
          />
        ) : null}
      </div>
    </DetailSection>
  );
};
