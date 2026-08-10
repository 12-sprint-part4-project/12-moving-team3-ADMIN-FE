'use client';

import { useCallback, useState } from 'react';

import { AdminCustomerDetailDrawer } from '@/components/AdminCustomerDetailDrawer/AdminCustomerDetailDrawer';
import {
  AdminMemberListView,
  type AdminMemberListColumnsContext,
} from '@/components/AdminMemberListView/AdminMemberListView';
import { Button } from '@/components/Button/Button';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import type { Column } from '@/components/DataTable/DataTable';
import type { AdminMemberListItem } from '@/types/adminMember';
import {
  formatAdminMemberJoinedAt,
  getAdminMemberRowNumber,
} from '@/utils/adminMember';

const MembersPage = () => {
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
      {
        key: 'name',
        header: '이름',
        render: (row) => (
          <span className="block max-w-32 truncate" title={row.name}>
            {row.name}
          </span>
        ),
      },
      {
        key: 'email',
        header: '이메일',
        render: (row) => (
          <span className="block max-w-56 truncate" title={row.email}>
            {row.email}
          </span>
        ),
      },
      {
        key: 'phoneNumber',
        header: '전화번호',
        render: (row) => {
          const phoneNumber = row.phoneNumber ?? '-';

          return (
            <span className="block max-w-32 truncate" title={phoneNumber}>
              {phoneNumber}
            </span>
          );
        },
      },
      {
        key: 'createdAt',
        header: '가입일',
        render: (row) => formatAdminMemberJoinedAt(row.createdAt),
      },
      {
        key: 'status',
        header: '상태',
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
        userType="CUSTOMER"
        title="회원 관리"
        description="일반 회원 목록을 조회하고 검색·필터할 수 있습니다."
        caption="일반 회원 목록"
        searchAriaLabel="회원 검색"
        emptyNoDataTitle="등록된 회원이 없습니다."
        errorTitle="회원 목록을 불러오지 못했습니다."
        getColumns={getColumns}
      />
      <AdminCustomerDetailDrawer
        memberId={selectedMemberId}
        open={Boolean(selectedMemberId)}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default MembersPage;
