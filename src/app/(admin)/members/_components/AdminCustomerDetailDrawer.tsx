'use client';

import { useTranslation } from 'react-i18next';

import {
  AdminMemberAccountStatusSection,
  AdminMemberBasicInfoSection,
  AdminMemberDetailDrawerShell,
  DetailField,
  formatRegion,
  formatServices,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailSection } from '@/components/DetailSection/DetailSection';

import type { AdminMemberDetail } from '@/types/adminMember';

export interface AdminCustomerDetailDrawerProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
}

interface CustomerDetailContentProps {
  detail: AdminMemberDetail;
}

const CustomerDetailContent = ({ detail }: CustomerDetailContentProps) => {
  const { t } = useTranslation();
  const customerProfile = detail.customerProfile;

  return (
    <div className="flex flex-col gap-4">
      <AdminMemberBasicInfoSection detail={detail} />
      <AdminMemberAccountStatusSection detail={detail} />

      {customerProfile ? (
        <DetailSection title={t('members.customer.profile')}>
          <dl className="flex flex-col gap-2 text-md-medium">
            <DetailField
              label={t('members.fields.preferredRegion')}
              value={formatRegion(customerProfile.region, t)}
            />
            <DetailField
              label={t('members.fields.services')}
              value={formatServices(customerProfile.service, t)}
            />
          </dl>
        </DetailSection>
      ) : null}
    </div>
  );
};

/**
 * 일반 회원(CUSTOMER) 상세 Drawer.
 * 공통 기본/계정 섹션을 재사용하고, 기사 전용 필드는 표시하지 않는다.
 */
export const AdminCustomerDetailDrawer = ({
  memberId,
  open,
  onClose,
}: AdminCustomerDetailDrawerProps) => {
  const { t } = useTranslation();
  return (
    <AdminMemberDetailDrawerShell
      memberId={memberId}
      open={open}
      onClose={onClose}
      title={t('members.customer.detailTitle')}
      errorTitle={t('members.customer.detailError')}
      emptyTitle={t('members.customer.detailEmpty')}
      renderContent={(detail) => <CustomerDetailContent detail={detail} />}
    />
  );
};
