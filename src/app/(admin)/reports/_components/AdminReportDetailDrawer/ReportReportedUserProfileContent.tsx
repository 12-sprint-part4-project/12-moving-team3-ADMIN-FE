import {
  DetailField,
  formatRegion,
  formatServices,
  REGION_LABEL,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';


import { DetailMultilineField } from './DetailMultilineField';
import { formatCareer, formatNullableText } from './helpers';
import { TargetUserProfileImage } from './TargetUserProfileImage';

import type {
  AdminReportDetailReportedCustomerProfileContent,
  AdminReportDetailReportedMoverProfileContent,
  AdminReportDetailMoverServiceRegion,
} from '@/types/adminReport';

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
}: MoverReportedProfileFieldsProps) => (
  <>
    <DetailField label="이름" value={content.name} />
    <DetailField label="닉네임" value={content.nickname} />
    <DetailMultilineField
      label="한 줄 소개"
      value={formatNullableText(content.shortDescription)}
    />
    <DetailMultilineField
      label="상세 소개"
      value={formatNullableText(content.description)}
    />
    <DetailField label="경력" value={formatCareer(content.career)} />
    <DetailField label="제공 서비스" value={formatServices(content.service)} />
    <DetailField
      label="서비스 지역"
      value={formatServiceRegions(content.serviceRegions)}
    />
  </>
);

const CustomerReportedProfileFields = ({
  content,
}: CustomerReportedProfileFieldsProps) => (
  <>
    <DetailField label="이름" value={content.name} />
    <DetailField label="닉네임" value={content.nickname} />
    <DetailField label="이용 서비스" value={formatServices(content.service)} />
    <DetailField label="지역" value={formatRegion(content.region)} />
  </>
);

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
