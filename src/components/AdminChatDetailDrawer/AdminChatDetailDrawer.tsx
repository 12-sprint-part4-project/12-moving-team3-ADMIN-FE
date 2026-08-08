'use client';

import {
  DetailField,
  formatNullableDateTime,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { AdminChatMessageList } from '@/components/AdminChatMessageList/AdminChatMessageList';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminChatDetail } from '@/hooks/useAdminChatDetail';
import type {
  AdminChatDetail,
  AdminChatParticipant,
} from '@/types/adminChat';
import {
  ADMIN_CHAT_ROOM_TYPE_LABEL,
  ADMIN_CHAT_USER_TYPE_LABEL,
} from '@/utils/adminChat';
import { formatAdminMemberJoinedAt } from '@/utils/adminMember';

export interface AdminChatDetailDrawerProps {
  open: boolean;
  /** 목록에서 선택한 채팅방 ID. null이면 상세 요청을 하지 않는다. */
  roomId: number | null;
  onClose: () => void;
}

interface ChatBasicInfoSectionProps {
  detail: AdminChatDetail;
}

/** 채팅방 ID·유형·생성/마지막 메시지 시각 */
const ChatBasicInfoSection = ({ detail }: ChatBasicInfoSectionProps) => (
  <DetailSection title="채팅방 기본 정보">
    <dl className="flex flex-col gap-2 text-md-medium">
      <DetailField label="채팅방 ID" value={detail.id} />
      <DetailField
        label="채팅방 유형"
        value={ADMIN_CHAT_ROOM_TYPE_LABEL[detail.roomType]}
      />
      <DetailField
        label="생성일"
        value={formatAdminMemberJoinedAt(detail.createdAt)}
      />
      <DetailField
        label="마지막 메시지 시각"
        value={formatNullableDateTime(detail.lastMessageAt)}
      />
    </dl>
  </DetailSection>
);

interface ChatLinkedInfoSectionProps {
  detail: AdminChatDetail;
}

/**
 * null이 아닌 연결 ID만 표시한다.
 * 전부 null이면 섹션 자체를 숨긴다.
 */
const ChatLinkedInfoSection = ({ detail }: ChatLinkedInfoSectionProps) => {
  const linkedFields: { label: string; value: number }[] = [];

  if (detail.estimateRequestId != null) {
    linkedFields.push({
      label: '견적 요청 ID',
      value: detail.estimateRequestId,
    });
  }

  if (detail.quoteId != null) {
    linkedFields.push({ label: '견적 ID', value: detail.quoteId });
  }

  if (detail.designatedMoverId != null) {
    linkedFields.push({
      label: '지정 기사 ID',
      value: detail.designatedMoverId,
    });
  }

  if (detail.communityPostId != null) {
    linkedFields.push({
      label: '커뮤니티 게시글 ID',
      value: detail.communityPostId,
    });
  }

  if (linkedFields.length === 0) {
    return null;
  }

  return (
    <DetailSection title="연결 정보">
      <dl className="flex flex-col gap-2 text-md-medium">
        {linkedFields.map(({ label, value }) => (
          <DetailField key={label} label={label} value={value} />
        ))}
      </dl>
    </DetailSection>
  );
};

interface ChatParticipantBlockProps {
  participant: AdminChatParticipant;
}

/** 참여자 1명 블록. 여러 명을 DetailField 한 줄에 몰지 않기 위해 분리한다. */
const ChatParticipantBlock = ({ participant }: ChatParticipantBlockProps) => {
  const isLeft = participant.leftAt != null;

  return (
    <div className="rounded-lg border border-line-100 bg-background-100 p-3">
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField label="이름" value={participant.name} />
        <DetailField label="닉네임" value={participant.nickname} />
        <DetailField label="이메일" value={participant.email} />
        <DetailField
          label="회원 유형"
          value={ADMIN_CHAT_USER_TYPE_LABEL[participant.userType]}
        />
        <DetailField
          label="참여 시각"
          value={formatAdminMemberJoinedAt(participant.joinedAt)}
        />
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-500">이탈 여부</dt>
          <dd>
            <StatusBadge
              variant={isLeft ? 'neutral' : 'success'}
              label={isLeft ? '이탈' : '참여 중'}
            />
          </dd>
        </div>
        {isLeft ? (
          <DetailField
            label="이탈 시각"
            value={formatNullableDateTime(participant.leftAt)}
          />
        ) : null}
        {participant.isDeleted ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">탈퇴 여부</dt>
            <dd>
              <StatusBadge variant="danger" label="탈퇴" />
            </dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
};

interface ChatParticipantsSectionProps {
  participants: AdminChatParticipant[];
}

const ChatParticipantsSection = ({
  participants,
}: ChatParticipantsSectionProps) => (
  <DetailSection title="참여자 정보">
    {participants.length === 0 ? (
      <p className="text-md-regular text-gray-500">참여자가 없습니다.</p>
    ) : (
      <div className="flex flex-col gap-3">
        {participants.map((participant) => (
          <ChatParticipantBlock
            key={participant.id}
            participant={participant}
          />
        ))}
      </div>
    )}
  </DetailSection>
);

interface ChatDetailContentProps {
  detail: AdminChatDetail;
  roomId: number;
  open: boolean;
}

const ChatDetailContent = ({
  detail,
  roomId,
  open,
}: ChatDetailContentProps) => (
  <div className="flex flex-col gap-4">
    <ChatBasicInfoSection detail={detail} />
    <ChatLinkedInfoSection detail={detail} />
    <ChatParticipantsSection participants={detail.participants} />
    {/* key로 room 전환 시 메시지 누적 상태를 완전히 초기화한다. */}
    <AdminChatMessageList key={roomId} roomId={roomId} enabled={open} />
  </div>
);

/**
 * 관리자 채팅방 상세 Drawer.
 * open + roomId일 때 상세 API를 호출하고, 로딩·에러·기본/연결/참여자 정보를 표시한다.
 */
export const AdminChatDetailDrawer = ({
  open,
  roomId,
  onClose,
}: AdminChatDetailDrawerProps) => {
  const { data, isPending, isError, isSuccess } = useAdminChatDetail(
    roomId ?? undefined,
    {
      enabled: open && Boolean(roomId),
    }
  );

  const detail = data?.data ?? null;
  // 응답 id가 현재 선택과 다를 때만 막아, 캐시/전환 중 잘못된 상세가 잠깐 보이지 않게 한다.
  const isDetailForSelection =
    detail != null && roomId != null && detail.id === roomId;

  const renderBody = () => {
    if (roomId == null) {
      return (
        <p className="text-md-regular text-gray-500">
          선택한 채팅방 정보가 없습니다.
        </p>
      );
    }

    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title="채팅방 상세를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
        />
      );
    }

    if (!isSuccess || !isDetailForSelection) {
      return (
        <EmptyState
          title="채팅방 정보가 없습니다."
          description="선택한 채팅방을 찾을 수 없습니다."
        />
      );
    }

    return (
      <ChatDetailContent detail={detail} roomId={roomId} open={open} />
    );
  };

  return (
    <DetailDrawer open={open} title="채팅방 상세" size="lg" onClose={onClose}>
      {renderBody()}
    </DetailDrawer>
  );
};
