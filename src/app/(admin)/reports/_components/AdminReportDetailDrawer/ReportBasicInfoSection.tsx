import { useTranslation } from 'react-i18next';

import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import {
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  formatAdminReportCreatedAt,
} from '@/utils/adminReport';

import { formatAdminLabel } from './helpers';

import type { AdminReportDetail } from '@/types/adminReport';

export const ReportBasicInfoSection = ({
  detail,
}: {
  detail: AdminReportDetail;
}) => {
  const { t, i18n } = useTranslation();
  return (
    <DetailSection title={t('reports.detail.basicInfo')}>
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField label={t('reports.fields.reportId')} value={detail.id} />
        <DetailField
          label={t('reports.fields.targetType')}
          value={t(`reports.target.${detail.target}`)}
        />
        <DetailField
          label={t('reports.fields.targetId')}
          value={detail.targetId}
        />
        <DetailField
          label={t('reports.fields.category')}
          value={t(`reports.category.${detail.category}`)}
        />
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-500">
            {t('reports.fields.status')}
          </dt>
          <dd>
            <StatusBadge
              variant={ADMIN_REPORT_STATUS_BADGE_VARIANT[detail.status]}
              label={t(`reports.status.${detail.status}`)}
            />
          </dd>
        </div>
        <DetailField
          label={t('reports.fields.createdAt')}
          value={formatAdminReportCreatedAt(
            detail.createdAt,
            i18n.resolvedLanguage ?? 'ko'
          )}
        />
        <DetailField
          label={t('reports.fields.admin')}
          value={formatAdminLabel(detail, t)}
        />
      </dl>
    </DetailSection>
  );
};
