'use client';

import { useCallback, useState } from 'react';

import { AdminChatDetailDrawer } from './AdminChatDetailDrawer';
import { AdminChatListView } from './AdminChatListView';
import { getChatListColumns } from './getChatListColumns';

/**
 * 채팅 목록과 상세 Drawer를 조합하는 라우트 전용 관리 컴포넌트.
 * 선택한 채팅방 ID를 한곳에서 관리해 목록 컬럼과 Drawer의 책임을 분리한다.
 */
export const ChatManagementContent = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const getColumns = useCallback(
    () => getChatListColumns(setSelectedRoomId),
    []
  );

  return (
    <>
      <AdminChatListView getColumns={getColumns} />
      <AdminChatDetailDrawer
        roomId={selectedRoomId}
        open={selectedRoomId !== null}
        onClose={() => setSelectedRoomId(null)}
      />
    </>
  );
};
