'use client';

import { useTranslation } from 'react-i18next';

import {
  AdminMemberAccountStatusSection,
  AdminMemberBasicInfoSection,
  AdminMemberDetailDrawerShell,
  DetailField,
  formatServices,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';

import type { AdminMemberDetail, MoverProfile } from '@/types/adminMember';

export interface AdminMoverDetailDrawerProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
}

const formatCareer = (
  career: number | null,
  t: ReturnType<typeof useTranslation>['t']
) => {
  if (career == null) {
    return '-';
  }

  return t('members.mover.careerValue', { career });
};

const formatAverageRating = (averageRating: number | null) => {
  if (averageRating == null) {
    return '-';
  }

  return averageRating.toFixed(1);
};

interface MoverProfileSectionProps {
  profile: MoverProfile;
}

const MoverProfileSection = ({ profile }: MoverProfileSectionProps) => {
  const { t } = useTranslation();
  const serviceRegions =
    profile.serviceRegions.length === 0
      ? '-'
      : profile.serviceRegions
          .map(({ region }) => t(`members.region.${region}`))
          .join(', ');
  return (
    <DetailSection title={t('members.mover.profile')}>
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField
          label={t('members.fields.serviceTypes')}
          value={formatServices(profile.service, t)}
        />
        <DetailField
          label={t('members.fields.serviceRegions')}
          value={serviceRegions}
        />
        <DetailField
          label={t('members.fields.career')}
          value={formatCareer(profile.career, t)}
        />
        <DetailField
          label={t('members.fields.shortDescription')}
          value={profile.shortDescription?.trim() || '-'}
        />
        <DetailField
          label={t('members.fields.description')}
          value={profile.description?.trim() || '-'}
        />
      </dl>
    </DetailSection>
  );
};

interface MoverStatsSectionProps {
  detail: AdminMemberDetail;
}

const MoverStatsSection = ({ detail }: MoverStatsSectionProps) => {
  const { t } = useTranslation();
  return (
    <DetailSection title={t('members.mover.statistics')}>
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField
          label={t('members.fields.averageRating')}
          value={formatAverageRating(detail.averageRating)}
        />
        <DetailField
          label={t('members.fields.reviewCount')}
          value={detail.reviewCount}
        />
        <DetailField
          label={t('members.fields.confirmedQuotes')}
          value={detail.confirmedQuoteCount}
        />
      </dl>
    </DetailSection>
  );
};

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
}: AdminMoverDetailDrawerProps) => {
  const { t } = useTranslation();
  return (
    <AdminMemberDetailDrawerShell
      memberId={memberId}
      open={open}
      onClose={onClose}
      title={t('members.mover.detailTitle')}
      errorTitle={t('members.mover.detailError')}
      emptyTitle={t('members.mover.detailEmpty')}
      renderContent={(detail) => <MoverDetailContent detail={detail} />}
    />
  );
};
