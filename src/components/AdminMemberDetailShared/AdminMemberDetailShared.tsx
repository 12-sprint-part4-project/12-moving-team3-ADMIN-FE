'use client';

import type { ReactNode } from 'react';

import { formatAdminMemberJoinedAt } from '@/components/AdminMemberListView/AdminMemberListView';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminMemberDetail } from '@/hooks/useAdminMemberDetail';
import type {
  AdminMemberDetail,
  MemberMoveType,
  MemberRegion,
} from '@/types/adminMember';

export const REGION_LABEL: Record<MemberRegion, string> = {
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

export const MOVE_TYPE_LABEL: Record<MemberMoveType, string> = {
  SMALL: '소형 이사',
  HOME: '가정 이사',
  OFFICE: '사무실 이사',
};

export const formatNullableDateTime = (iso: string | null) => {
  if (!iso) {
    return '-';
  }

  return formatAdminMemberJoinedAt(iso);
};

export const formatRegion = (region: MemberRegion | null) => {
  if (!region) {
    return '-';
  }

  return REGION_LABEL[region] ?? region;
};

export const formatServices = (services: MemberMoveType[]) => {
  if (services.length === 0) {
    return '-';
  }

  return services
    .map((service) => MOVE_TYPE_LABEL[service] ?? service)
    .join(', ');
};

/** DetailSection 안 dl 행 */
export const DetailField = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between gap-4">
    <dt className="shrink-0 text-gray-500">{label}</dt>
    <dd className="text-right break-words text-black-400">{value}</dd>
  </div>
);

/** 회원/기사 공통 기본 정보 */
export const AdminMemberBasicInfoSection = ({
  detail,
}: {
  detail: AdminMemberDetail;
}) => (
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
);

/** 회원/기사 공통 계정 상태 */
export const AdminMemberAccountStatusSection = ({
  detail,
}: {
  detail: AdminMemberDetail;
}) => {
  // UserStatusInfo가 없으면 목록과 같이 ACTIVE로 표시한다.
  const status = detail.userStatus?.status ?? 'ACTIVE';
  const suspendedAt = detail.userStatus?.suspendedAt ?? null;
  const suspendedUntil = detail.userStatus?.suspendedUntil ?? null;

  return (
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
  );
};

export interface AdminMemberDetailDrawerShellProps {
  memberId: string | null;
  open: boolean;
  onClose: () => void;
  title: string;
  errorTitle: string;
  emptyTitle: string;
  renderContent: (detail: AdminMemberDetail) => ReactNode;
}

/**
 * 회원/기사 상세 Drawer 공통 셸.
 * 조회·로딩·에러·빈 상태를 담당하고, 본문만 renderContent로 주입한다.
 */
export const AdminMemberDetailDrawerShell = ({
  memberId,
  open,
  onClose,
  title,
  errorTitle,
  emptyTitle,
  renderContent,
}: AdminMemberDetailDrawerShellProps) => {
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
          title={errorTitle}
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (!isSuccess || !detail) {
      return (
        <EmptyState
          title={emptyTitle}
          description="선택한 회원을 찾을 수 없습니다."
        />
      );
    }

    return renderContent(detail);
  };

  return (
    <DetailDrawer open={open} title={title} onClose={onClose}>
      {renderBody()}
    </DetailDrawer>
  );
};
