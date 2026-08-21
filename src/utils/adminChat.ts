import { translateCurrentUiValue } from '@/i18n/format';

import type {
  AdminChatLastMessage,
  AdminChatParticipant,
  AdminChatRoomType,
  AdminChatUserType,
} from '@/types/adminChat';

/** 발신자·참여자 공통 표시명에 필요한 최소 필드 */
interface AdminChatNamedUser {
  name: string;
  nickname: string;
  userType: AdminChatUserType;
}

/** 채팅방 유형 → 한글 라벨. enum 원문을 UI에 노출하지 않기 위해 매핑한다. */
export const ADMIN_CHAT_ROOM_TYPE_LABEL: Record<AdminChatRoomType, string> = {
  GENERAL: '일반',
  DESIGNATED: '지정 견적',
  COMMUNITY: '커뮤니티',
};

/**
 * 참여자 userType → 한글 라벨.
 * 목록 셀 `닉네임(회원 유형)` 표기에 사용한다.
 */
export const ADMIN_CHAT_USER_TYPE_LABEL: Record<AdminChatUserType, string> = {
  CUSTOMER: '고객',
  MOVER: '기사',
};

/**
 * `닉네임(회원 유형)` 표기.
 * 닉네임이 비어 있으면 name으로 fallback한다.
 */
export const formatAdminChatUserLabel = (user: AdminChatNamedUser) => {
  const displayName = user.nickname.trim() || user.name.trim() || '-';
  const userTypeLabel = translateCurrentUiValue(
    ADMIN_CHAT_USER_TYPE_LABEL[user.userType]
  );

  return `${displayName}(${userTypeLabel})`;
};

/**
 * 참여자 목록 셀 문구.
 * 예: `길동이(고객), 빠른이사맨(기사)`
 */
export const formatAdminChatParticipants = (
  participants: AdminChatParticipant[]
) => {
  if (participants.length === 0) {
    return '-';
  }

  return participants
    .map((participant) => formatAdminChatUserLabel(participant))
    .join(', ');
};

/**
 * 목록 마지막 메시지 미리보기.
 * TEXT는 content, IMAGE는 고정 문구, 없으면 안내 문구를 쓴다.
 */
export const formatAdminChatLastMessagePreview = (
  lastMessage: AdminChatLastMessage | null
) => {
  if (!lastMessage) {
    return translateCurrentUiValue('메시지 없음');
  }

  if (lastMessage.messageType === 'IMAGE') {
    return translateCurrentUiValue('이미지 메시지');
  }

  const content = lastMessage.content.trim();

  return content.length > 0 ? content : '-';
};
