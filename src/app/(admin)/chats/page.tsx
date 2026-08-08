'use client';

import { useCallback, useState } from 'react';

import { AdminChatDetailDrawer } from '@/components/AdminChatDetailDrawer/AdminChatDetailDrawer';
import { AdminChatListView } from '@/components/AdminChatListView/AdminChatListView';
import { Button } from '@/components/Button/Button';
import type { Column } from '@/components/DataTable/DataTable';
import type { AdminChatListItem } from '@/types/adminChat';
import {
  ADMIN_CHAT_ROOM_TYPE_LABEL,
  formatAdminChatLastMessagePreview,
  formatAdminChatParticipants,
} from '@/utils/adminChat';
import { formatAdminMemberJoinedAt } from '@/utils/adminMember';

const ChatsPage = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const handleCloseDetail = () => {
    setSelectedRoomId(null);
  };

  const getColumns = useCallback((): Column<AdminChatListItem>[] => [
    {
      key: 'participants',
      header: '참여자',
      className: 'max-w-80',
      render: (row) => (
        <span
          className="block truncate"
          title={formatAdminChatParticipants(row.participants)}
        >
          {formatAdminChatParticipants(row.participants)}
        </span>
      ),
    },
    {
      key: 'roomType',
      header: '채팅방 유형',
      render: (row) => ADMIN_CHAT_ROOM_TYPE_LABEL[row.roomType],
    },
    {
      key: 'lastMessage',
      header: '마지막 메시지',
      className: 'max-w-72',
      render: (row) => {
        const preview = formatAdminChatLastMessagePreview(row.lastMessage);

        return (
          <span className="block truncate" title={preview}>
            {preview}
          </span>
        );
      },
    },
    {
      key: 'lastMessageAt',
      header: '마지막 메시지 시각',
      render: (row) =>
        row.lastMessageAt ? formatAdminMemberJoinedAt(row.lastMessageAt) : '-',
    },
    {
      key: 'actions',
      header: '관리',
      align: 'center',
      render: (row) => (
        <Button
          variant="secondary"
          className="px-3 py-1.5 text-sm-medium"
          onClick={() => setSelectedRoomId(row.id)}
        >
          상세 보기
        </Button>
      ),
    },
  ], []);

  return (
    <>
      <AdminChatListView getColumns={getColumns} />
      <AdminChatDetailDrawer
        roomId={selectedRoomId}
        open={Boolean(selectedRoomId)}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default ChatsPage;
