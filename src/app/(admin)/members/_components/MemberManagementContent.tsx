'use client';

import { useCallback, useState } from 'react';

import { AdminMemberListView } from '@/components/AdminMemberListView/AdminMemberListView';

import { AdminCustomerDetailDrawer } from './AdminCustomerDetailDrawer';
import { getMemberListColumns } from './getMemberListColumns';

/**
 * 일반 회원 목록과 상세 Drawer를 조합한다.
 * 공통 목록의 검색·필터 동작은 유지하고 선택 회원 상태만 라우트에서 소유한다.
 */
export const MemberManagementContent = () => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const getColumns = useCallback(
    (context: Parameters<typeof getMemberListColumns>[0]) =>
      getMemberListColumns(context, setSelectedMemberId),
    []
  );

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
        open={selectedMemberId !== null}
        onClose={() => setSelectedMemberId(null)}
      />
    </>
  );
};
