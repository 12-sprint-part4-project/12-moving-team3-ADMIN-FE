'use client';

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

const CustomerDetailContent = ({ detail }: { detail: AdminMemberDetail }) => {
  const customerProfile = detail.customerProfile;

  return (
    <div className="flex flex-col gap-4">
      <AdminMemberBasicInfoSection detail={detail} />
      <AdminMemberAccountStatusSection detail={detail} />

      {customerProfile ? (
        <DetailSection title="회원 프로필">
          <dl className="flex flex-col gap-2 text-md-medium">
            <DetailField
              label="희망 지역"
              value={formatRegion(customerProfile.region)}
            />
            <DetailField
              label="이용 서비스"
              value={formatServices(customerProfile.service)}
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
}: AdminCustomerDetailDrawerProps) => (
  <AdminMemberDetailDrawerShell
    memberId={memberId}
    open={open}
    onClose={onClose}
    title="회원 상세"
    errorTitle="회원 상세를 불러오지 못했습니다."
    emptyTitle="회원 정보가 없습니다."
    renderContent={(detail) => <CustomerDetailContent detail={detail} />}
  />
);
