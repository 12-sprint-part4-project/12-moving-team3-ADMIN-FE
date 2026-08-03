'use client';

import { useCallback, useState } from 'react';

import {
  AdminMemberListView,
  type AdminMemberListColumnsContext,
} from '@/components/AdminMemberListView/AdminMemberListView';
import { AdminMoverDetailDrawer } from '@/components/AdminMoverDetailDrawer/AdminMoverDetailDrawer';
import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Column } from '@/components/DataTable/DataTable';
import type { AdminMemberListItem } from '@/types/adminMember';
import {
  formatAdminMemberJoinedAt,
  getAdminMemberRowNumber,
} from '@/utils/adminMember';

/** 목록 API averageRating 표시. 리뷰가 없으면 '-' */
const formatAverageRating = (averageRating: number | null) => {
  if (averageRating == null) {
    return '-';
  }

  return averageRating.toFixed(1);
};

const DriversPage = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const getColumns = useCallback(
    ({
      page,
      pageSize,
    }: AdminMemberListColumnsContext): Column<AdminMemberListItem>[] => [
      {
        key: 'index',
        header: '번호',
        render: (_row, index) => getAdminMemberRowNumber(page, pageSize, index),
      },
      { key: 'name', header: '이름', accessor: 'name' },
      { key: 'nickname', header: '닉네임', accessor: 'nickname' },
      { key: 'email', header: '이메일', accessor: 'email' },
      {
        key: 'phoneNumber',
        header: '전화번호',
        render: (row) => row.phoneNumber ?? '-',
      },
      // 목록 API의 MOVER 전용 필드. 서비스 지역은 상세에만 있어 목록에 표시하지 않는다.
      {
        key: 'averageRating',
        header: '평점',
        align: 'center',
        render: (row) => formatAverageRating(row.averageRating),
      },
      {
        key: 'createdAt',
        header: '가입일',
        render: (row) => formatAdminMemberJoinedAt(row.createdAt),
      },
      {
        key: 'status',
        header: '계정 상태',
        align: 'center',
        render: (row) => (
          <StatusBadge
            variant={row.status === 'ACTIVE' ? 'success' : 'danger'}
            label={row.status === 'ACTIVE' ? '활성' : '정지'}
          />
        ),
      },
      {
        key: 'actions',
        header: '관리',
        align: 'center',
        render: (row) => (
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-sm-medium"
            onClick={() => setSelectedMemberId(row.id)}
          >
            상세 보기
          </Button>
        ),
      },
    ],
    []
  );

  const handleCloseDetail = () => {
    setSelectedMemberId(null);
  };

  return (
    <>
      <AdminMemberListView
        userType="MOVER"
        title="기사 관리"
        description="기사 목록을 조회하고 검색·필터할 수 있습니다."
        caption="기사 목록"
        searchAriaLabel="기사 검색"
        emptyNoDataTitle="등록된 기사가 없습니다."
        errorTitle="기사 목록을 불러오지 못했습니다."
        getColumns={getColumns}
      />
      <AdminMoverDetailDrawer
        memberId={selectedMemberId}
        open={Boolean(selectedMemberId)}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default DriversPage;
