import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { AdminReportDetail } from '@/types/adminReport';
import { ADMIN_REPORT_USER_TYPE_LABEL } from '@/utils/adminReport';

import {
  formatNullableDateTime,
  getTargetPresenceStatus,
  TARGET_PRESENCE_BADGE_VARIANT,
  TARGET_PRESENCE_HINT,
  TARGET_PRESENCE_LABEL,
} from './helpers';
import { ReportProfileSection } from './ReportProfileSection';
import { TargetUserProfileImage } from './TargetUserProfileImage';

/**
 * 신고 대상 정보.
 * 대상 타입/ID는 기본 정보에 있으므로 여기서는 상태·작성자(·프로필)만 둔다.
 */
export const ReportTargetInfoSection = ({
  detail,
}: {
  detail: AdminReportDetail;
}) => {
  const { targetInfo, category } = detail;
  const targetUser = targetInfo.user;
  const presenceStatus = getTargetPresenceStatus(targetInfo);
  const presenceHint = TARGET_PRESENCE_HINT[presenceStatus];
  const isInappropriateProfile = category === 'INAPPROPRIATE_PROFILE';
  // 프로필 신고인데 대상이 회원이 아니면 이상 케이스 — 콘텐츠 대신 짧은 경고만 둔다.
  const isUnexpectedProfileTarget =
    isInappropriateProfile && detail.target !== 'USER';

  // 대상 섹션은 계정(작성자) 삭제일만 본다. 콘텐츠 삭제는 content 섹션에서 표시한다.
  const deletedAt = targetUser?.deletedAt ?? null;

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
        {targetUser ? (
          <>
            <div className="flex items-start gap-3">
              <TargetUserProfileImage
                key={targetUser.profileImageKey ?? targetUser.id}
                user={targetUser}
              />
              {/*
                상태도 이 dl 안에 둬 아바타 옆 라벨 열과 정렬을 맞춘다.
                전체 너비로 빼면 라벨이 아바타 아래로 밀려 깨져 보인다.
              */}
              <dl className="flex min-w-0 flex-1 flex-col gap-2 text-md-medium">
                <DetailField label="이름" value={targetUser.name} />
                <DetailField label="닉네임" value={targetUser.nickname} />
                <DetailField label="이메일" value={targetUser.email} />
                {!isInappropriateProfile ? (
                  <DetailField
                    label="유저 타입"
                    value={ADMIN_REPORT_USER_TYPE_LABEL[targetUser.userType]}
                  />
                ) : null}
                {!isInappropriateProfile ? presenceStatusFields : null}
              </dl>
            </div>
            {isInappropriateProfile ? (
              <>
                <ReportProfileSection targetUser={targetUser} />
                <dl className="flex flex-col gap-2 text-md-medium">
                  {presenceStatusFields}
                </dl>
              </>
            ) : null}
          </>
        ) : (
          <dl className="flex flex-col gap-2 text-md-medium">
            {presenceStatusFields}
          </dl>
        )}
        {presenceHint ? (
          <p className="text-md-regular text-gray-500">{presenceHint}</p>
        ) : null}
      </div>
    </DetailSection>
  );
};
