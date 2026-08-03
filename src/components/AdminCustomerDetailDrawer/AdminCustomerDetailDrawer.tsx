'use client';

import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { formatAdminMemberJoinedAt } from '@/components/AdminMemberListView/AdminMemberListView';
import { useAdminMemberDetail } from '@/hooks/useAdminMemberDetail';
import type {
  AdminMemberDetail,
  MemberMoveType,
  MemberRegion,
} from '@/types/adminMember';

export interface AdminCustomerDetailDrawerProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
}

const REGION_LABEL: Record<MemberRegion, string> = {
  SEOUL: '서울',
  GYEONGGI: '경기',
  INCHEON: '인천',
  GANGWON: '강원',
  CHUNGBUK: '충북',
  CHUNGNAM: '충남',
  SEJONG: '세종',
  DAEJEON: '대전',
  JEONBUK: '전북',
  GWANGJU_JEONNAM: '광주·전남',
  GYEONGBUK: '경북',
  DAEGU: '대구',
  ULSAN: '울산',
  GYEONGNAM: '경남',
  BUSAN: '부산',
  JEJU: '제주',
};

const MOVE_TYPE_LABEL: Record<MemberMoveType, string> = {
  SMALL: '소형 이사',
  HOME: '가정 이사',
  OFFICE: '사무실 이사',
};

const formatNullableDateTime = (iso: string | null) => {
  if (!iso) {
    return '-';
  }

  return formatAdminMemberJoinedAt(iso);
};

const formatRegion = (region: MemberRegion | null) => {
  if (!region) {
    return '-';
  }

  return REGION_LABEL[region] ?? region;
};

const formatServices = (services: MemberMoveType[]) => {
  if (services.length === 0) {
    return '-';
  }

  return services.map((service) => MOVE_TYPE_LABEL[service] ?? service).join(', ');
};

/** DetailSection 안 dl 행 */
const DetailField = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between gap-4">
    <dt className="shrink-0 text-gray-500">{label}</dt>
    <dd className="text-right text-black-400">{value}</dd>
  </div>
);

const CustomerDetailContent = ({ detail }: { detail: AdminMemberDetail }) => {
  // UserStatusInfo가 없으면 목록과 같이 ACTIVE로 표시한다.
  const status = detail.userStatus?.status ?? 'ACTIVE';
  const suspendedAt = detail.userStatus?.suspendedAt ?? null;
  const suspendedUntil = detail.userStatus?.suspendedUntil ?? null;
  const customerProfile = detail.customerProfile;

  return (
    <div className="flex flex-col gap-4">
      <DetailSection title="기본 정보">
        <dl className="flex flex-col gap-2 text-md-medium">
          <DetailField label="이름" value={detail.name} />
          <DetailField label="닉네임" value={detail.nickname} />
          <DetailField label="이메일" value={detail.email} />
          <DetailField label="전화번호" value={detail.phoneNumber ?? '-'} />
          <DetailField
            label="가입일"
            value={formatAdminMemberJoinedAt(detail.createdAt)}
          />
        </dl>
      </DetailSection>

      <DetailSection title="계정 상태">
        <dl className="flex flex-col gap-2 text-md-medium">
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">계정 상태</dt>
            <dd>
              <StatusBadge
                variant={status === 'ACTIVE' ? 'success' : 'danger'}
                label={status === 'ACTIVE' ? '활성' : '정지'}
              />
            </dd>
          </div>
          <DetailField
            label="정지 시작일"
            value={formatNullableDateTime(suspendedAt)}
          />
          <DetailField
            label="정지 종료일"
            value={formatNullableDateTime(suspendedUntil)}
          />
          <DetailField label="신고 횟수" value={detail.reportCount} />
        </dl>
      </DetailSection>

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
 * useAdminMemberDetail로 조회하며, 기사 전용 필드는 표시하지 않는다.
 */
export const AdminCustomerDetailDrawer = ({
  memberId,
  open,
  onClose,
}: AdminCustomerDetailDrawerProps) => {
  const { data, isPending, isError, isSuccess } = useAdminMemberDetail(
    memberId,
    { enabled: open && Boolean(memberId) }
  );

  const detail = data?.data;

  const renderBody = () => {
    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="회원 상세를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (!isSuccess || !detail) {
      return (
        <EmptyState
          title="회원 정보가 없습니다."
          description="선택한 회원을 찾을 수 없습니다."
        />
      );
    }

    return <CustomerDetailContent detail={detail} />;
  };

  return (
    <DetailDrawer open={open} title="회원 상세" onClose={onClose}>
      {renderBody()}
    </DetailDrawer>
  );
};
