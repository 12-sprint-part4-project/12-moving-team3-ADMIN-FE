'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { AdminMemberListView } from '@/components/AdminMemberListView/AdminMemberListView';
import { useDetailSearchParam } from '@/hooks/useDetailSearchParam';
import {
  buildAdminMemberListQuery,
  toAdminMemberDetailQuery,
} from '@/utils/adminMember';
import { parseAdminMemberListSearchParams } from '@/utils/adminMemberListSearchParams';
import { parseUuidDetailId } from '@/utils/detailSearchParams';

import { AdminMoverDetailDrawer } from './AdminMoverDetailDrawer';
import { getDriverListColumns } from './getDriverListColumns';

/**
 * 기사 목록과 상세 Drawer를 조합한다.
 * 고객 목록과 공유하는 필터 로직은 AdminMemberListView에 그대로 위임한다.
 */
export const DriverManagementContent = () => {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseAdminMemberListSearchParams(
        new URLSearchParams(searchParams.toString())
      ),
    [searchParams]
  );
  const detailQuery = useMemo(
    () => toAdminMemberDetailQuery(buildAdminMemberListQuery('MOVER', filters)),
    [filters]
  );
  const { detailId, setDetailId: updateSelectedMember } =
    useDetailSearchParam('memberId');
  const selectedMemberId = parseUuidDetailId(detailId);
  const getColumns = useCallback(
    (context: Parameters<typeof getDriverListColumns>[0]) =>
      getDriverListColumns(
        context,
        updateSelectedMember,
        t,
        i18n.resolvedLanguage ?? 'ko'
      ),
    [i18n.resolvedLanguage, updateSelectedMember, t]
  );
  const handleNavigateDetail = useCallback(
    (memberId: string) => updateSelectedMember(memberId, { replace: true }),
    [updateSelectedMember]
  );

  return (
    <>
      <AdminMemberListView
        userType="MOVER"
        title={t('members.mover.title')}
        description={t('members.mover.description')}
        caption={t('members.mover.caption')}
        emptyNoDataTitle={t('members.mover.empty')}
        errorTitle={t('members.mover.error')}
        getColumns={getColumns}
      />
      <AdminMoverDetailDrawer
        memberId={selectedMemberId}
        open={selectedMemberId !== null}
        detailQuery={detailQuery}
        onNavigate={handleNavigateDetail}
        onClose={() => updateSelectedMember(null)}
      />
    </>
  );
};
