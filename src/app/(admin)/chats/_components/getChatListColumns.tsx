import { Button } from '@/components/Button/Button';
import {
  ADMIN_CHAT_ROOM_TYPE_LABEL,
  formatAdminChatLastMessagePreview,
  formatAdminChatParticipants,
} from '@/utils/adminChat';
import { formatAdminMemberJoinedAt } from '@/utils/adminMember';

import type { Column } from '@/components/DataTable/DataTable';
import type { AdminChatListItem } from '@/types/adminChat';

/**
 * 채팅방 목록 전용 컬럼을 생성한다.
 * 상세 열기 동작을 인자로 받아 컬럼 정의가 Drawer 상태를 직접 소유하지 않게 한다.
 */
export const getChatListColumns = (
  onOpenDetail: (roomId: number) => void
): Column<AdminChatListItem>[] => [
  {
    key: 'id',
    header: '채팅방 ID',
    render: (row) => row.id,
  },
  {
    key: 'participants',
    header: '참여자',
    className: 'max-w-80',
    render: (row) => {
      // 참여자가 많아도 테이블 너비가 밀리지 않도록 화면에는 말줄임하고 전체 값은 title로 제공한다.
      const participants = formatAdminChatParticipants(row.participants);

      return (
        <span className="block truncate" title={participants}>
          {participants}
        </span>
      );
    },
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
      // 메시지 본문과 이미지 메시지의 표시 규칙은 공통 formatter에 위임한다.
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
        onClick={() => onOpenDetail(row.id)}
      >
        상세 보기
      </Button>
    ),
  },
];
