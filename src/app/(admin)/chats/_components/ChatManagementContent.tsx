'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useDetailSearchParam } from '@/hooks/useDetailSearchParam';
import {
  buildAdminChatListQuery,
  toAdminChatDetailQuery,
} from '@/utils/adminChat';
import { parseAdminChatSearchParams } from '@/utils/adminListSearchParams';
import { parseNumericDetailId } from '@/utils/detailSearchParams';

import { AdminChatDetailDrawer } from './AdminChatDetailDrawer';
import { AdminChatListView } from './AdminChatListView';
import { getChatListColumns } from './getChatListColumns';

/**
 * 채팅 목록과 상세 Drawer를 조합하는 라우트 전용 관리 컴포넌트.
 * 선택한 채팅방 ID를 한곳에서 관리해 목록 컬럼과 Drawer의 책임을 분리한다.
 */
export const ChatManagementContent = () => {
  const { t, i18n } = useTranslation();
  const searchParams = useSearchParams();
  const filters = useMemo(
    () =>
      parseAdminChatSearchParams(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );
  const detailQuery = useMemo(
    () => toAdminChatDetailQuery(buildAdminChatListQuery(filters)),
    [filters]
  );
  const { detailId, setDetailId } = useDetailSearchParam('roomId');
  const selectedRoomId = parseNumericDetailId(detailId);
  const handleOpenDetail = useCallback(
    (roomId: number) => setDetailId(String(roomId)),
    [setDetailId]
  );
  const handleNavigateDetail = useCallback(
    (roomId: number) => setDetailId(String(roomId), { replace: true }),
    [setDetailId]
  );
  const getColumns = useCallback(
    () =>
      getChatListColumns(handleOpenDetail, t, i18n.resolvedLanguage ?? 'ko'),
    [handleOpenDetail, i18n.resolvedLanguage, t]
  );

  return (
    <>
      <AdminChatListView getColumns={getColumns} />
      <AdminChatDetailDrawer
        roomId={selectedRoomId}
        open={selectedRoomId !== null}
        detailQuery={detailQuery}
        onNavigate={handleNavigateDetail}
        onClose={() => setDetailId(null)}
      />
    </>
  );
};
