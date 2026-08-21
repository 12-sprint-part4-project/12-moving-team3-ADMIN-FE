import { useTranslation } from 'react-i18next';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import {
  ADMIN_REPORT_CONTENT_METADATA_LABEL,
  formatAdminReportContentMetadataValue,
  getAdminReportContentSummary,
  hasMeaningfulContentTitle,
} from '@/utils/adminReport';
import { htmlToPlainText } from '@/utils/htmlToPlainText';

import { DetailMultilineField } from './DetailMultilineField';
import { formatNullableDateTime } from './helpers';
import { ReportProcessActionToggle } from './ReportProcessActionToggle';
import { ReportReportedUserProfileContent } from './ReportReportedUserProfileContent';

import type { AdminReportDetail } from '@/types/adminReport';
import type { ReactNode } from 'react';

const ReportContentMetadataFields = ({
  metadata,
  excludeKeys,
}: {
  metadata: Record<string, unknown>;
  /** 요약 줄에 이미 쓴 키는 중복 노출하지 않는다. */
  excludeKeys?: string[];
}): ReactNode => {
  const { t, i18n } = useTranslation();
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
      label={t(`reports.metadata.${key}`, {
        defaultValue: ADMIN_REPORT_CONTENT_METADATA_LABEL[key] ?? key,
      })}
      value={formatAdminReportContentMetadataValue(
        key,
        value,
        t,
        i18n.resolvedLanguage ?? 'ko'
      )}
    />
  ));
};

/** content null일 때 안내 문구. soft-delete 원본은 content로 내려오므로 삭제됨 ≠ 본문 없음이다. */
const getEmptyContentMessageKey = (detail: AdminReportDetail) => {
  if (!detail.targetInfo.exists) {
    return 'reports.detail.missingTargetContent';
  }

  return 'reports.detail.noContent';
};

export interface ReportContentSectionProps {
  detail: AdminReportDetail;
  /** DELETE_REPORTED_CONTENT 선택 여부. 상위(ReportDetailContent)에서 관리한다. */
  isDeleteContentSelected: boolean;
  onToggleDeleteContent: () => void;
}

export const ReportContentSection = ({
  detail,
  isDeleteContentSelected,
  onToggleDeleteContent,
}: ReportContentSectionProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'ko';
  const {
    content,
    category,
    availableActions,
    status,
    reportedContent,
    target,
  } = detail;
  // BE 허용 여부만 본다. USER/MESSAGE·이미 삭제는 canDeleteContent=false다.
  const canDeleteContent = availableActions?.canDeleteContent === true;
  const isDeleteDisabled = status !== 'PENDING';

  const deleteActionToggle = canDeleteContent ? (
    <ReportProcessActionToggle
      label={t('reports.action.DELETE_REPORTED_CONTENT')}
      selected={isDeleteContentSelected}
      disabled={isDeleteDisabled}
      disabledReason={
        isDeleteDisabled ? t('reports.detail.deleteDisabled') : null
      }
      onToggle={onToggleDeleteContent}
    />
  ) : null;

  // USER 신고: reportedContent 프로필을 콘텐츠 영역에 표시한다. 삭제 Action은 노출하지 않는다.
  if (target === 'USER') {
    if (reportedContent?.type === 'USER') {
      return (
        <DetailSection title={t('reports.detail.contentInfo')}>
          <ReportReportedUserProfileContent content={reportedContent} />
        </DetailSection>
      );
    }

    return (
      <DetailSection title={t('reports.detail.contentInfo')}>
        <p className="text-md-regular text-gray-500">
          {t('reports.detail.noProfile')}
        </p>
      </DetailSection>
    );
  }

  // 부적절한 프로필인데 USER가 아니면 콘텐츠 섹션을 숨긴다 (기존 정책).
  if (category === 'INAPPROPRIATE_PROFILE') {
    return null;
  }

  if (!content) {
    return (
      <DetailSection title={t('reports.detail.contentInfo')}>
        <div className="flex flex-col gap-3">
          <p className="text-md-regular text-gray-500">
            {t(getEmptyContentMessageKey(detail))}
          </p>
          {deleteActionToggle}
        </div>
      </DetailSection>
    );
  }

  const summary = getAdminReportContentSummary(content, t);
  const showTitle = hasMeaningfulContentTitle(content);
  const rawBodyText = content.body?.trim() ? content.body : null;
  const displayBodyText =
    content.type === 'ARTICLE' && rawBodyText
      ? htmlToPlainText(rawBodyText)
      : rawBodyText;
  const bodyText = displayBodyText?.trim() ? displayBodyText : null;

  return (
    <DetailSection title={t('reports.detail.contentInfo')}>
      <div className="flex flex-col gap-3">
        {/* 유형별 검토 핵심(별점·원글 등)을 먼저 보여 본문 맥락을 잡는다. */}
        {summary ? (
          <p className="text-md-semibold text-black-400">{summary.text}</p>
        ) : null}
        <dl className="flex flex-col gap-2 text-md-medium">
          {showTitle ? (
            <DetailField
              label={t('reports.fields.title')}
              value={content.title ?? '-'}
            />
          ) : null}
          {bodyText ? (
            <DetailMultilineField
              label={t('reports.fields.body')}
              value={bodyText}
            />
          ) : null}
          {/* soft-delete 원본 조회 — 생성일·삭제일은 값 없어도 필드를 항상 노출한다. */}
          <DetailField
            label={t('reports.fields.contentCreatedAt')}
            value={formatNullableDateTime(content.createdAt, locale)}
          />
          <DetailField
            label={t('reports.fields.deletedAt')}
            value={formatNullableDateTime(content.deletedAt, locale)}
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
            {t('reports.detail.deletedContentHint')}
          </p>
        ) : null}
        {deleteActionToggle}
      </div>
    </DetailSection>
  );
};
