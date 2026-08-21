import { useTranslation } from 'react-i18next';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';

import { formatNullableDateTime } from './helpers';
import { TargetUserProfileImage } from './TargetUserProfileImage';

import type { AdminReportDetail } from '@/types/adminReport';

export const ReportReporterSection = ({
  detail,
}: {
  detail: AdminReportDetail;
}) => {
  const { t, i18n } = useTranslation();
  const { reporter } = detail;

  return (
    <DetailSection title={t('reports.detail.reporterInfo')}>
      <div className="flex items-start gap-3">
        <TargetUserProfileImage
          key={reporter.profileImageKey ?? reporter.id}
          user={reporter}
        />
        <dl className="flex min-w-0 flex-1 flex-col gap-2 text-md-medium">
          <DetailField label={t('reports.fields.name')} value={reporter.name} />
          <DetailField
            label={t('reports.fields.nickname')}
            value={reporter.nickname}
          />
          <DetailField
            label={t('reports.fields.email')}
            value={reporter.email}
          />
          <DetailField
            label={t('reports.fields.userType')}
            value={t(`reports.userType.${reporter.userType}`)}
          />
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">
              {t('reports.fields.accountStatus')}
            </dt>
            <dd>
              <StatusBadge
                variant={reporter.isDeleted ? 'danger' : 'success'}
                label={t(
                  reporter.isDeleted
                    ? 'reports.account.withdrawn'
                    : 'reports.account.active'
                )}
              />
            </dd>
          </div>
          {/* soft-delete 원본 조회 — 미탈퇴여도 필드는 항상 두고 null은 '-'로 본다. */}
          <DetailField
            label={t('reports.fields.withdrawnAt')}
            value={formatNullableDateTime(
              reporter.deletedAt,
              i18n.resolvedLanguage ?? 'ko'
            )}
          />
        </dl>
      </div>
    </DetailSection>
  );
};
