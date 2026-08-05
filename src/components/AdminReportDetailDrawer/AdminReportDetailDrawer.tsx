'use client';

import axios from 'axios';
import type { ReactNode } from 'react';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { Button } from '@/components/Button/Button';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminReportDetail } from '@/hooks/useAdminReportDetail';
import type {
  AdminReportDetail,
  AdminReportDetailContent,
  AdminReportDetailTargetInfo,
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

/**
 * 대상 미존재·삭제는 API 실패가 아니므로 상세 필드와 함께 안내만 표시한다.
 */
const TargetStatusNotice = ({
  targetInfo,
  content,
}: {
  targetInfo: AdminReportDetailTargetInfo;
  content: AdminReportDetailContent | null;
}) => {
  if (!targetInfo.exists) {
    return (
      <p className="rounded-md border border-line-200 bg-background-200 px-3 py-2 text-md-regular text-gray-700">
        신고 대상이 존재하지 않습니다.
      </p>
    );
  }

  if (!targetInfo.isDeleted) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 rounded-md border border-line-200 bg-background-200 px-3 py-2 text-md-regular text-gray-700">
      <p>삭제된 신고 대상입니다.</p>
      {content?.deletedAt ? (
        <p className="text-gray-500">
          삭제일: {formatAdminReportCreatedAt(content.deletedAt)}
        </p>
      ) : null}
    </div>
  );
};

const ReportTargetInfoSection = ({ detail }: { detail: AdminReportDetail }) => {
  const { targetInfo, content } = detail;
  const targetUser = targetInfo.user;

  return (
    <DetailSection title="신고 대상 정보">
      <div className="flex flex-col gap-3">
        <TargetStatusNotice targetInfo={targetInfo} content={content} />
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
              <DetailField
                label="대상 사용자 이메일"
                value={targetUser.email}
              />
            </>
          ) : null}
        </dl>
      </div>
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

/** content null일 때 대상 상태에 맞는 안내 문구를 고른다. */
const getEmptyContentMessage = (detail: AdminReportDetail) => {
  if (!detail.targetInfo.exists) {
    return '신고 대상이 존재하지 않아 콘텐츠를 표시할 수 없습니다.';
  }

  if (detail.targetInfo.isDeleted) {
    return '삭제된 신고 대상의 콘텐츠가 없습니다.';
  }

  return '신고된 콘텐츠가 없습니다.';
};

const ReportContentSection = ({ detail }: { detail: AdminReportDetail }) => {
  const { content } = detail;

  if (!content) {
    return (
      <DetailSection title="신고된 콘텐츠 정보">
        <p className="text-md-regular text-gray-500">
          {getEmptyContentMessage(detail)}
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
    <ReportContentSection detail={detail} />
  </div>
);

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
