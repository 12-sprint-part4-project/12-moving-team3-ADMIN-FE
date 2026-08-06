'use client';

import axios from 'axios';
import { useState, type ReactNode } from 'react';

import {
  DetailField,
  formatRegion,
  formatServices,
  REGION_LABEL,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import {
  StatusBadge,
  type StatusBadgeProps,
} from '@/components/StatusBadge/StatusBadge';
import { useAdminReportDetail } from '@/hooks/useAdminReportDetail';
import type {
  AdminReportDetail,
  AdminReportDetailCustomerProfile,
  AdminReportDetailMoverProfile,
  AdminReportDetailMoverServiceRegion,
  AdminReportDetailTargetInfo,
  AdminReportDetailUserSummary,
} from '@/types/adminReport';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_CONTENT_METADATA_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  ADMIN_REPORT_USER_TYPE_LABEL,
  formatAdminReportContentMetadataValue,
  formatAdminReportCreatedAt,
  getAdminReportContentSummary,
  hasMeaningfulContentTitle,
} from '@/utils/adminReport';
import { getS3ImageUrl } from '@/utils/imageUrl';

export interface AdminReportDetailDrawerProps {
  open: boolean;
  /** 목록에서 선택한 신고 ID. null이면 상세 요청을 하지 않는다. */
  reportId: number | null;
  onClose: () => void;
}

/** null/빈 문자열은 '-'로 통일해 빈 칸이 어색하게 보이지 않게 한다. */
const formatNullableText = (value: string | null | undefined) => {
  if (value == null || value.trim() === '') {
    return '-';
  }

  return value;
};

/** 날짜 필드용. null이면 '-' */
const formatNullableDateTime = (iso: string | null) => {
  if (!iso) {
    return '-';
  }

  return formatAdminReportCreatedAt(iso);
};

/** 긴 본문용. 라벨 아래에 두고 줄바꿈을 유지한다. */
const DetailMultilineField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div className="flex flex-col gap-1">
    <dt className="shrink-0 text-gray-500">{label}</dt>
    <dd className="whitespace-pre-wrap break-words text-black-400">{value}</dd>
  </div>
);

const formatAdminLabel = (detail: AdminReportDetail) => {
  if (!detail.admin) {
    return '담당자 없음';
  }

  return `${detail.admin.name} (${detail.admin.email})`;
};

/** API 실패 메시지. 404는 신고 없음으로 구분해 안내한다. */
const getDetailErrorTitle = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return '신고 정보를 찾을 수 없습니다.';
  }

  return '신고 상세를 불러오지 못했습니다.';
};

const ReportBasicInfoSection = ({ detail }: { detail: AdminReportDetail }) => (
  <DetailSection title="신고 기본 정보">
    <dl className="flex flex-col gap-2 text-md-medium">
      <DetailField label="신고 ID" value={detail.id} />
      <DetailField
        label="신고 대상 타입"
        value={ADMIN_REPORT_TARGET_LABEL[detail.target]}
      />
      <DetailField label="신고 대상 ID" value={detail.targetId} />
      <DetailField
        label="신고 카테고리"
        value={ADMIN_REPORT_CATEGORY_LABEL[detail.category]}
      />
      <div className="flex items-center justify-between gap-4">
        <dt className="shrink-0 text-gray-500">신고 상태</dt>
        <dd>
          <StatusBadge
            variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[detail.status]}
            label={ADMIN_REPORT_STATUS_LABEL[detail.status]}
          />
        </dd>
      </div>
      <DetailField
        label="접수일"
        value={formatAdminReportCreatedAt(detail.createdAt)}
      />
      <DetailField label="처리 관리자" value={formatAdminLabel(detail)} />
    </dl>
  </DetailSection>
);

const ReportReporterSection = ({ detail }: { detail: AdminReportDetail }) => {
  const { reporter } = detail;

  return (
    <DetailSection title="신고자 정보">
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField label="이름" value={reporter.name} />
        <DetailField label="닉네임" value={reporter.nickname} />
        <DetailField label="이메일" value={reporter.email} />
        <DetailField
          label="유저 타입"
          value={ADMIN_REPORT_USER_TYPE_LABEL[reporter.userType]}
        />
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-500">계정 상태</dt>
          <dd>
            <StatusBadge
              variant={reporter.isDeleted ? 'danger' : 'success'}
              label={reporter.isDeleted ? '탈퇴' : '정상'}
            />
          </dd>
        </div>
        {/* soft-delete 원본 조회 — 미탈퇴여도 필드는 항상 두고 null은 '-'로 본다. */}
        <DetailField
          label="탈퇴일"
          value={formatNullableDateTime(reporter.deletedAt)}
        />
      </dl>
    </DetailSection>
  );
};

/** exists/isDeleted를 관리자가 읽기 쉬운 단일 상태로 합친다. */
type TargetPresenceStatus = 'active' | 'deleted' | 'missing';

const getTargetPresenceStatus = (
  targetInfo: AdminReportDetailTargetInfo
): TargetPresenceStatus => {
  if (!targetInfo.exists) {
    return 'missing';
  }

  if (targetInfo.isDeleted) {
    return 'deleted';
  }

  return 'active';
};

const TARGET_PRESENCE_LABEL: Record<TargetPresenceStatus, string> = {
  active: '정상',
  deleted: '삭제됨',
  missing: '대상 없음',
};

const TARGET_PRESENCE_BADGE_VARIANT: Record<
  TargetPresenceStatus,
  NonNullable<StatusBadgeProps['variant']>
> = {
  active: 'success',
  deleted: 'danger',
  missing: 'neutral',
};

const TARGET_PRESENCE_HINT: Record<TargetPresenceStatus, string | null> = {
  active: null,
  deleted: '이 대상은 삭제되어 현재 서비스에 노출되지 않습니다.',
  missing: '신고 대상을 확인할 수 없습니다.',
};

/**
 * 신고 대상 사용자 프로필 이미지.
 * key가 없거나 로드 실패 시 이름/닉네임 이니셜로 fallback한다.
 */
const TargetUserProfileImage = ({
  user,
}: {
  user: AdminReportDetailUserSummary;
}) => {
  const imageUrl = getS3ImageUrl(user.profileImageKey);
  const [hasError, setHasError] = useState(false);
  const initial = (user.nickname || user.name || '?').trim().charAt(0);
  // 부모에서 profileImageKey로 remount해 URL 변경 시 실패 상태를 초기화한다.
  const showImage = Boolean(imageUrl) && !hasError;

  return (
    <div
      className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background-300 text-lg-semibold text-gray-500"
      aria-label={`${user.name} 프로필 이미지`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- S3 공개 URL + onError fallback이 필요해 img를 쓴다.
        <img
          src={imageUrl ?? undefined}
          alt=""
          className="size-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <span aria-hidden>{initial}</span>
      )}
    </div>
  );
};

/** 경력 null이면 '-', 있으면 n년 */
const formatCareer = (career: number | null) => {
  if (career == null) {
    return '-';
  }

  return `${career}년`;
};

/** 서비스 지역 배열 → 한글 라벨 콤마 구분 */
const formatServiceRegions = (
  serviceRegions: AdminReportDetailMoverServiceRegion[]
) => {
  if (serviceRegions.length === 0) {
    return '-';
  }

  return serviceRegions
    .map(({ region }) => REGION_LABEL[region] ?? region)
    .join(', ');
};

const CustomerProfileFields = ({
  profile,
}: {
  profile: AdminReportDetailCustomerProfile;
}) => (
  <>
    <DetailField label="지역" value={formatRegion(profile.region)} />
    <DetailField label="서비스" value={formatServices(profile.service)} />
  </>
);

const MoverProfileFields = ({
  profile,
}: {
  profile: AdminReportDetailMoverProfile;
}) => (
  <>
    <DetailField label="서비스" value={formatServices(profile.service)} />
    <DetailField label="경력" value={formatCareer(profile.career)} />
    <DetailMultilineField
      label="한 줄 소개"
      value={formatNullableText(profile.shortDescription)}
    />
    <DetailMultilineField
      label="상세 소개"
      value={formatNullableText(profile.description)}
    />
    <DetailField
      label="서비스 지역"
      value={formatServiceRegions(profile.serviceRegions)}
    />
  </>
);

/**
 * userType에 맞는 프로필 필드.
 * 프로필이 없으면 안내 문구를 반환한다.
 */
const renderTargetProfileFields = (
  targetUser: AdminReportDetailUserSummary
): ReactNode => {
  const profile = targetUser.profile;
  const emptyMessage = (
    <p className="text-md-regular text-gray-500">프로필 정보가 없습니다.</p>
  );

  if (!profile) {
    return emptyMessage;
  }

  if (targetUser.userType === 'CUSTOMER') {
    return profile.customer ? (
      <dl className="flex flex-col gap-2 text-md-medium">
        <CustomerProfileFields profile={profile.customer} />
      </dl>
    ) : (
      emptyMessage
    );
  }

  if (targetUser.userType === 'MOVER') {
    return profile.mover ? (
      <dl className="flex flex-col gap-2 text-md-medium">
        <MoverProfileFields profile={profile.mover} />
      </dl>
    ) : (
      emptyMessage
    );
  }

  return emptyMessage;
};

/**
 * 신고 대상 정보.
 * 대상 타입/ID는 기본 정보에 있으므로 여기서는 상태·작성자(·프로필)만 둔다.
 */
const ReportTargetInfoSection = ({ detail }: { detail: AdminReportDetail }) => {
  const { targetInfo, content, category } = detail;
  const targetUser = targetInfo.user;
  const presenceStatus = getTargetPresenceStatus(targetInfo);
  const presenceHint = TARGET_PRESENCE_HINT[presenceStatus];
  const isInappropriateProfile = category === 'INAPPROPRIATE_PROFILE';
  // 프로필 신고인데 대상이 회원이 아니면 이상 케이스 — 콘텐츠 대신 짧은 경고만 둔다.
  const isUnexpectedProfileTarget =
    isInappropriateProfile && detail.target !== 'USER';

  // content·user 어디에 있든 soft-delete 시각을 통일해 보여 준다.
  const deletedAt = content?.deletedAt ?? targetUser?.deletedAt ?? null;

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
                {renderTargetProfileFields(targetUser)}
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

const ReportContentMetadataFields = ({
  metadata,
  excludeKeys,
}: {
  metadata: Record<string, unknown>;
  /** 요약 줄에 이미 쓴 키는 중복 노출하지 않는다. */
  excludeKeys?: string[];
}): ReactNode => {
  const excluded = new Set(excludeKeys ?? []);
  const entries = Object.entries(metadata).filter(([key]) => !excluded.has(key));

  if (entries.length === 0) {
    return null;
  }

  return entries.map(([key, value]) => (
    <DetailField
      key={key}
      label={ADMIN_REPORT_CONTENT_METADATA_LABEL[key] ?? key}
      value={formatAdminReportContentMetadataValue(key, value)}
    />
  ));
};

/** content null일 때 안내 문구. soft-delete 원본은 content로 내려오므로 삭제됨 ≠ 본문 없음이다. */
const getEmptyContentMessage = (detail: AdminReportDetail) => {
  if (!detail.targetInfo.exists) {
    return '신고 대상이 존재하지 않아 콘텐츠를 표시할 수 없습니다.';
  }

  return '신고된 콘텐츠가 없습니다.';
};

/**
 * 욕설/비방 + USER는 별도 본문이 없어 이름·이메일 요약 content가 어색하다.
 * 섹션은 유지하되 안내만 보여 준다.
 */
const isUserAbusiveLanguageReport = (detail: AdminReportDetail) =>
  detail.category === 'ABUSIVE_LANGUAGE' && detail.target === 'USER';

const ReportContentSection = ({ detail }: { detail: AdminReportDetail }) => {
  const { content, category } = detail;

  // 부적절한 프로필 신고는 프로필 검토가 핵심이므로 콘텐츠 섹션을 숨긴다.
  if (category === 'INAPPROPRIATE_PROFILE') {
    return null;
  }

  if (isUserAbusiveLanguageReport(detail)) {
    return (
      <DetailSection title="신고된 콘텐츠 정보">
        <p className="text-md-regular text-gray-500">
          회원 대상 욕설/비방 신고입니다. 별도 본문 콘텐츠가 없습니다. 신고
          대상 정보에서 회원을 확인해 주세요.
        </p>
      </DetailSection>
    );
  }

  if (!content) {
    return (
      <DetailSection title="신고된 콘텐츠 정보">
        <p className="text-md-regular text-gray-500">
          {getEmptyContentMessage(detail)}
        </p>
      </DetailSection>
    );
  }

  const summary = getAdminReportContentSummary(content);
  const showTitle = hasMeaningfulContentTitle(content);
  const bodyText = content.body?.trim() ? content.body : null;

  return (
    <DetailSection title="신고된 콘텐츠 정보">
      <div className="flex flex-col gap-3">
        {/* 유형별 검토 핵심(별점·원글 등)을 먼저 보여 본문 맥락을 잡는다. */}
        {summary ? (
          <p className="text-md-semibold text-black-400">{summary.text}</p>
        ) : null}
        {!bodyText && content.type === 'CHAT_ROOM' ? (
          <div className="flex flex-col gap-1 text-md-regular text-gray-500">
            <p>채팅방 자체에는 본문이 없습니다. 아래 부가 정보로 확인해 주세요.</p>
            {/* 욕설 근거는 방 단위가 아니라 MESSAGE 대상 신고의 본문으로 본다. */}
            <p>
              욕설/비방 근거는 메시지(MESSAGE) 단위 신고로 확인해 주세요.
            </p>
          </div>
        ) : null}
        <dl className="flex flex-col gap-2 text-md-medium">
          {showTitle ? (
            <DetailField label="제목" value={content.title ?? '-'} />
          ) : null}
          {bodyText ? (
            <DetailMultilineField label="본문" value={bodyText} />
          ) : null}
          {/* soft-delete 원본 조회 — 생성일·삭제일은 값 없어도 필드를 항상 노출한다. */}
          <DetailField
            label="생성일"
            value={formatNullableDateTime(content.createdAt)}
          />
          <DetailField
            label="삭제일"
            value={formatNullableDateTime(content.deletedAt)}
          />
          {content.metadata ? (
            <ReportContentMetadataFields
              metadata={content.metadata}
              excludeKeys={summary?.usedMetadataKeys}
            />
          ) : null}
        </dl>
        {/* soft-delete 원본은 보여 주되, 서비스 미노출임을 대상 섹션과 같은 톤으로 안내한다. */}
        {content.deletedAt ? (
          <p className="text-md-regular text-gray-500">
            이 콘텐츠는 삭제되어 현재 서비스에 노출되지 않습니다.
          </p>
        ) : null}
      </div>
    </DetailSection>
  );
};

/**
 * 카테고리별 검토 우선순위에 맞춰 섹션 순서를 조정한다.
 * - 욕설/비방: 콘텐츠 → 대상 → 신고자
 * - 부적절한 프로필: 대상 프로필 → 신고자 (콘텐츠 없음)
 */
const ReportDetailContent = ({ detail }: { detail: AdminReportDetail }) => {
  const isInappropriateProfile = detail.category === 'INAPPROPRIATE_PROFILE';

  return (
    <div className="flex flex-col gap-4">
      <ReportBasicInfoSection detail={detail} />
      {isInappropriateProfile ? (
        <>
          <ReportTargetInfoSection detail={detail} />
          <ReportReporterSection detail={detail} />
        </>
      ) : (
        <>
          <ReportContentSection detail={detail} />
          <ReportTargetInfoSection detail={detail} />
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

    return <ReportDetailContent detail={detail} />;
  };

  return (
    <DetailDrawer open={open} title="신고 상세" onClose={onClose}>
      {renderBody()}
    </DetailDrawer>
  );
};
