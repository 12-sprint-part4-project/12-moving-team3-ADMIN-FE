'use client';

import type { ReactNode } from 'react';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type {
  AdminReportDetail,
  AdminReportDetailContent,
} from '@/types/adminReport';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  ADMIN_REPORT_USER_TYPE_LABEL,
  formatAdminReportCreatedAt,
} from '@/utils/adminReport';

export interface AdminReportDetailDrawerProps {
  open: boolean;
  /** 목록에서 선택한 신고 ID. detail이 없을 때 placeholder에 사용한다. */
  reportId: number | null;
  /** 상세 API 응답 data. 이번 단계에서는 prop으로만 받으며, 호출은 다음 커밋에서 연결한다. */
  detail: AdminReportDetail | null;
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

const formatBooleanLabel = (value: boolean) => (value ? '예' : '아니오');

/**
 * metadata value를 안전하게 표시 문자열로 만든다.
 * 객체·배열은 JSON으로, 그 외는 String으로 변환한다.
 */
const formatMetadataValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'string') {
    return value.trim() === '' ? '-' : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
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

const ReportReporterSection = ({ detail }: { detail: AdminReportDetail }) => (
  <DetailSection title="신고자 정보">
    <dl className="flex flex-col gap-2 text-md-medium">
      <DetailField label="이름" value={detail.reporter.name} />
      <DetailField label="닉네임" value={detail.reporter.nickname} />
      <DetailField label="이메일" value={detail.reporter.email} />
      <DetailField
        label="유저 타입"
        value={ADMIN_REPORT_USER_TYPE_LABEL[detail.reporter.userType]}
      />
      <DetailField
        label="탈퇴 여부"
        value={formatBooleanLabel(detail.reporter.isDeleted)}
      />
    </dl>
  </DetailSection>
);

const ReportTargetInfoSection = ({ detail }: { detail: AdminReportDetail }) => {
  const { targetInfo } = detail;
  const targetUser = targetInfo.user;

  return (
    <DetailSection title="신고 대상 정보">
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField
          label="대상 타입"
          value={ADMIN_REPORT_TARGET_LABEL[targetInfo.type]}
        />
        <DetailField label="대상 ID" value={targetInfo.id} />
        <DetailField
          label="존재 여부"
          value={formatBooleanLabel(targetInfo.exists)}
        />
        <DetailField
          label="삭제 여부"
          value={formatBooleanLabel(targetInfo.isDeleted)}
        />
        {targetUser ? (
          <>
            <DetailField label="대상 사용자 이름" value={targetUser.name} />
            <DetailField
              label="대상 사용자 닉네임"
              value={targetUser.nickname}
            />
            <DetailField label="대상 사용자 이메일" value={targetUser.email} />
          </>
        ) : null}
      </dl>
    </DetailSection>
  );
};

const ReportContentMetadataFields = ({
  metadata,
}: {
  metadata: Record<string, unknown>;
}): ReactNode => {
  const entries = Object.entries(metadata);

  if (entries.length === 0) {
    return null;
  }

  return entries.map(([key, value]) => (
    <DetailField key={key} label={key} value={formatMetadataValue(value)} />
  ));
};

const ReportContentSection = ({
  content,
}: {
  content: AdminReportDetailContent | null;
}) => {
  if (!content) {
    return (
      <DetailSection title="신고된 콘텐츠 정보">
        <p className="text-md-regular text-gray-500">
          신고된 콘텐츠가 없습니다.
        </p>
      </DetailSection>
    );
  }

  return (
    <DetailSection title="신고된 콘텐츠 정보">
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField
          label="콘텐츠 타입"
          value={ADMIN_REPORT_TARGET_LABEL[content.type]}
        />
        <DetailField label="제목" value={formatNullableText(content.title)} />
        <DetailMultilineField
          label="본문/내용"
          value={formatNullableText(content.body)}
        />
        <DetailField
          label="생성일"
          value={formatNullableDateTime(content.createdAt)}
        />
        <DetailField
          label="삭제일"
          value={formatNullableDateTime(content.deletedAt)}
        />
        {content.metadata ? (
          <ReportContentMetadataFields metadata={content.metadata} />
        ) : null}
      </dl>
    </DetailSection>
  );
};

const ReportDetailContent = ({ detail }: { detail: AdminReportDetail }) => (
  <div className="flex flex-col gap-4">
    <ReportBasicInfoSection detail={detail} />
    <ReportReporterSection detail={detail} />
    <ReportTargetInfoSection detail={detail} />
    <ReportContentSection content={detail.content} />
  </div>
);

/**
 * 신고 상세 Drawer.
 * detail prop으로 받은 데이터를 섹션별로 표시한다.
 * API 호출·로딩·에러 처리는 다음 커밋에서 연결한다.
 */
export const AdminReportDetailDrawer = ({
  open,
  reportId,
  detail,
  onClose,
}: AdminReportDetailDrawerProps) => (
  <DetailDrawer open={open} title="신고 상세" onClose={onClose}>
    {detail ? (
      <ReportDetailContent detail={detail} />
    ) : reportId == null ? (
      <p className="text-md-regular text-gray-500">
        선택한 신고 정보가 없습니다.
      </p>
    ) : (
      <p className="text-md-regular text-gray-700">
        선택된 신고 ID: {reportId}
      </p>
    )}
  </DetailDrawer>
);
