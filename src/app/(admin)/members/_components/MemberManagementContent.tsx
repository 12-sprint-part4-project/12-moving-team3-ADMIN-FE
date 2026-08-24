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

import { AdminCustomerDetailDrawer } from './AdminCustomerDetailDrawer';
import { getMemberListColumns } from './getMemberListColumns';

/**
 * 일반 회원 목록과 상세 Drawer를 조합한다.
 * 공통 목록의 검색·필터 동작은 유지하고 선택 회원 상태만 라우트에서 소유한다.
 */
export const MemberManagementContent = () => {
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
    () => toAdminMemberDetailQuery(buildAdminMemberListQuery('CUSTOMER', filters)),
    [filters]
  );
  const { detailId, setDetailId: updateSelectedMember } =
    useDetailSearchParam('memberId');
  const selectedMemberId = parseUuidDetailId(detailId);

  const getColumns = useCallback(
    (context: Parameters<typeof getMemberListColumns>[0]) =>
      getMemberListColumns(
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
        userType="CUSTOMER"
        title={t('members.customer.title')}
        description={t('members.customer.description')}
        caption={t('members.customer.caption')}
        emptyNoDataTitle={t('members.customer.empty')}
        errorTitle={t('members.customer.error')}
        getColumns={getColumns}
      />
      <AdminCustomerDetailDrawer
        memberId={selectedMemberId}
        open={selectedMemberId !== null}
        detailQuery={detailQuery}
        onNavigate={handleNavigateDetail}
        onClose={() => updateSelectedMember(null)}
      />
    </>
  );
};
