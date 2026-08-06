import type { ReactNode } from 'react';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import type { AdminReportDetail } from '@/types/adminReport';
import {
  ADMIN_REPORT_CONTENT_METADATA_LABEL,
  formatAdminReportContentMetadataValue,
  getAdminReportContentSummary,
  hasMeaningfulContentTitle,
} from '@/utils/adminReport';

import { DetailMultilineField } from './DetailMultilineField';
import { formatNullableDateTime } from './helpers';

const ReportContentMetadataFields = ({
  metadata,
  excludeKeys,
}: {
  metadata: Record<string, unknown>;
  /** 요약 줄에 이미 쓴 키는 중복 노출하지 않는다. */
  excludeKeys?: string[];
}): ReactNode => {
  const excluded = new Set(excludeKeys ?? []);
  const entries = Object.entries(metadata).filter(
    ([key]) => !excluded.has(key)
  );

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

export const ReportContentSection = ({
  detail,
}: {
  detail: AdminReportDetail;
}) => {
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
            <p>
              채팅방 자체에는 본문이 없습니다. 아래 부가 정보로 확인해 주세요.
            </p>
            {/* 욕설 근거는 방 단위가 아니라 MESSAGE 대상 신고의 본문으로 본다. */}
            <p>욕설/비방 근거는 메시지(MESSAGE) 단위 신고로 확인해 주세요.</p>
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
