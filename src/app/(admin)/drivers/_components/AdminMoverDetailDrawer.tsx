'use client';

import {
  AdminMemberAccountStatusSection,
  AdminMemberBasicInfoSection,
  AdminMemberDetailDrawerShell,
  DetailField,
  formatServices,
  REGION_LABEL,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';

import type {
  AdminMemberDetail,
  MoverProfile,
  MoverServiceRegion,
} from '@/types/adminMember';

export interface AdminMoverDetailDrawerProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
}

const formatCareer = (career: number | null) => {
  if (career == null) {
    return '-';
  }

  return `${career}년`;
};

const formatAverageRating = (averageRating: number | null) => {
  if (averageRating == null) {
    return '-';
  }

  return averageRating.toFixed(1);
};

const formatServiceRegions = (serviceRegions: MoverServiceRegion[]) => {
  if (serviceRegions.length === 0) {
    return '-';
  }

  return serviceRegions
    .map(({ region }) => REGION_LABEL[region] ?? region)
    .join(', ');
};

interface MoverProfileSectionProps {
  profile: MoverProfile;
}

const MoverProfileSection = ({ profile }: MoverProfileSectionProps) => (
  <DetailSection title="기사 프로필">
    <dl className="flex flex-col gap-2 text-md-medium">
      <DetailField
        label="서비스 유형"
        value={formatServices(profile.service)}
      />
      <DetailField
        label="서비스 지역"
        value={formatServiceRegions(profile.serviceRegions)}
      />
      <DetailField label="경력" value={formatCareer(profile.career)} />
      <DetailField
        label="한 줄 소개"
        value={profile.shortDescription?.trim() || '-'}
      />
      <DetailField
        label="상세 소개"
        value={profile.description?.trim() || '-'}
      />
    </dl>
  </DetailSection>
);

interface MoverStatsSectionProps {
  detail: AdminMemberDetail;
}

const MoverStatsSection = ({ detail }: MoverStatsSectionProps) => (
  <DetailSection title="기사 통계">
    <dl className="flex flex-col gap-2 text-md-medium">
      <DetailField
        label="평균 평점"
        value={formatAverageRating(detail.averageRating)}
      />
      <DetailField label="리뷰 수" value={detail.reviewCount} />
      <DetailField label="확정 견적 수" value={detail.confirmedQuoteCount} />
    </dl>
  </DetailSection>
);

interface MoverDetailContentProps {
  detail: AdminMemberDetail;
}

const MoverDetailContent = ({ detail }: MoverDetailContentProps) => {
  const moverProfile = detail.moverProfile;

  return (
    <div className="flex flex-col gap-4">
      <AdminMemberBasicInfoSection detail={detail} />
      <AdminMemberAccountStatusSection detail={detail} />
      {moverProfile ? <MoverProfileSection profile={moverProfile} /> : null}
      <MoverStatsSection detail={detail} />
    </div>
  );
};

/**
 * 기사(MOVER) 상세 Drawer.
 * 공통 기본/계정 섹션을 재사용하고, 프로필·통계는 기사 전용으로 표시한다.
 */
export const AdminMoverDetailDrawer = ({
  memberId,
  open,
  onClose,
}: AdminMoverDetailDrawerProps) => (
  <AdminMemberDetailDrawerShell
    memberId={memberId}
    open={open}
    onClose={onClose}
    title="기사 상세"
    errorTitle="기사 상세를 불러오지 못했습니다."
    emptyTitle="기사 정보가 없습니다."
    renderContent={(detail) => <MoverDetailContent detail={detail} />}
  />
);
