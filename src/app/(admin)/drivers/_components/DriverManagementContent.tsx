'use client';

import { useCallback } from 'react';

import { AdminMemberListView } from '@/components/AdminMemberListView/AdminMemberListView';
import { useDetailSearchParam } from '@/hooks/useDetailSearchParam';
import { parseUuidDetailId } from '@/utils/detailSearchParams';

import { AdminMoverDetailDrawer } from './AdminMoverDetailDrawer';
import { getDriverListColumns } from './getDriverListColumns';

/**
 * 기사 목록과 상세 Drawer를 조합한다.
 * 고객 목록과 공유하는 필터 로직은 AdminMemberListView에 그대로 위임한다.
 */
export const DriverManagementContent = () => {
  const { detailId, setDetailId: updateSelectedMember } =
    useDetailSearchParam('memberId');
  const selectedMemberId = parseUuidDetailId(detailId);
  const getColumns = useCallback(
    (context: Parameters<typeof getDriverListColumns>[0]) =>
      getDriverListColumns(context, updateSelectedMember),
    [updateSelectedMember]
  );

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
        open={selectedMemberId !== null}
        onClose={() => updateSelectedMember(null)}
      />
    </>
  );
};
