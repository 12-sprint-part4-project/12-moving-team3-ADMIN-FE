import { useTranslation } from 'react-i18next';

import {
  DetailField,
  formatRegion,
  formatServices,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';

import { DetailMultilineField } from './DetailMultilineField';
import { formatCareer, formatNullableText } from './helpers';
import { TargetUserProfileImage } from './TargetUserProfileImage';

import type {
  AdminReportDetailReportedCustomerProfileContent,
  AdminReportDetailReportedMoverProfileContent,
  AdminReportDetailMoverServiceRegion,
} from '@/types/adminReport';
import type { TFunction } from 'i18next';

/** 서비스 지역 배열 → 한글 라벨 콤마 구분 */
const formatServiceRegions = (
  serviceRegions: AdminReportDetailMoverServiceRegion[],
  t: TFunction
) => {
  if (serviceRegions.length === 0) {
    return '-';
  }

  return serviceRegions
    .map(({ region }) => t(`members.region.${region}`))
    .join(', ');
};

interface MoverReportedProfileFieldsProps {
  content: AdminReportDetailReportedMoverProfileContent;
}

interface CustomerReportedProfileFieldsProps {
  content: AdminReportDetailReportedCustomerProfileContent;
}

/** MOVER/CUSTOMER reportedContent 판별 유니온 — 유니온은 type으로 유지한다. */
type ReportedUserProfileContent =
  | AdminReportDetailReportedMoverProfileContent
  | AdminReportDetailReportedCustomerProfileContent;

interface ReportReportedUserProfileContentProps {
  content: ReportedUserProfileContent;
}

const MoverReportedProfileFields = ({
  content,
}: MoverReportedProfileFieldsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <DetailField label={t('reports.fields.name')} value={content.name} />
      <DetailField
        label={t('reports.fields.nickname')}
        value={content.nickname}
      />
      <DetailMultilineField
        label={t('members.fields.shortDescription')}
        value={formatNullableText(content.shortDescription)}
      />
      <DetailMultilineField
        label={t('members.fields.description')}
        value={formatNullableText(content.description)}
      />
      <DetailField
        label={t('members.fields.career')}
        value={formatCareer(content.career, t)}
      />
      <DetailField
        label={t('members.fields.serviceTypes')}
        value={formatServices(content.service, t)}
      />
      <DetailField
        label={t('members.fields.serviceRegions')}
        value={formatServiceRegions(content.serviceRegions, t)}
      />
    </>
  );
};

const CustomerReportedProfileFields = ({
  content,
}: CustomerReportedProfileFieldsProps) => {
  const { t } = useTranslation();
  return (
    <>
      <DetailField label={t('reports.fields.name')} value={content.name} />
      <DetailField
        label={t('reports.fields.nickname')}
        value={content.nickname}
      />
      <DetailField
        label={t('members.fields.services')}
        value={formatServices(content.service, t)}
      />
      <DetailField
        label={t('members.fields.region')}
        value={formatRegion(content.region, t)}
      />
    </>
  );
};

/**
 * USER 신고 reportedContent 프로필.
 * type=USER + userType으로 MOVER/CUSTOMER를 분기한다.
 */
export const ReportReportedUserProfileContent = ({
  content,
}: ReportReportedUserProfileContentProps) => (
  <div className="flex items-start gap-3">
    <TargetUserProfileImage
      key={content.profileImageKey ?? content.id}
      user={content}
    />
    <dl className="flex min-w-0 flex-1 flex-col gap-2 text-md-medium">
      {content.userType === 'MOVER' ? (
        <MoverReportedProfileFields content={content} />
      ) : (
        <CustomerReportedProfileFields content={content} />
      )}
    </dl>
  </div>
);
