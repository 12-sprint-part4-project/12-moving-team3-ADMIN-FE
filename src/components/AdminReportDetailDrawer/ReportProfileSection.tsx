import {
  DetailField,
  formatRegion,
  formatServices,
  REGION_LABEL,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import type {
  AdminReportDetailCustomerProfile,
  AdminReportDetailMoverProfile,
  AdminReportDetailMoverServiceRegion,
  AdminReportDetailUserSummary,
} from '@/types/adminReport';

import { DetailMultilineField } from './DetailMultilineField';
import { formatCareer, formatNullableText } from './helpers';

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
export const ReportProfileSection = ({
  targetUser,
}: {
  targetUser: AdminReportDetailUserSummary;
}) => {
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
