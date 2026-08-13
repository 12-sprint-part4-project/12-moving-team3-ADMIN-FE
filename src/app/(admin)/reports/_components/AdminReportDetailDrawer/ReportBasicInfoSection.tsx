import { DetailField } from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { AdminReportDetail } from '@/types/adminReport';
import {
  ADMIN_REPORT_CATEGORY_LABEL,
  ADMIN_REPORT_STATUS_BADGE_VARIANT,
  ADMIN_REPORT_STATUS_LABEL,
  ADMIN_REPORT_TARGET_LABEL,
  formatAdminReportCreatedAt,
} from '@/utils/adminReport';

import { formatAdminLabel } from './helpers';

export const ReportBasicInfoSection = ({
  detail,
}: {
  detail: AdminReportDetail;
}) => (
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
