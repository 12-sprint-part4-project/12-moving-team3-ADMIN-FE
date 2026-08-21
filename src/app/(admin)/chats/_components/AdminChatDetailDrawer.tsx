'use client';

import { useTranslation } from 'react-i18next';

import {
  DetailField,
  formatNullableDateTime,
} from '@/components/AdminMemberDetailShared/AdminMemberDetailShared';
import { DetailDrawer } from '@/components/DetailDrawer/DetailDrawer';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { useAdminChatDetail } from '@/hooks/useAdminChatDetail';
import { formatAdminMemberJoinedAt } from '@/utils/adminMember';

import { AdminChatMessageList } from './AdminChatMessageList';

import type { AdminChatDetail, AdminChatParticipant } from '@/types/adminChat';

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
const ChatBasicInfoSection = ({ detail }: ChatBasicInfoSectionProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'ko';
  return (
    <DetailSection title={t('chats.detail.basicInfo')}>
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField label={t('chats.fields.roomId')} value={detail.id} />
        <DetailField
          label={t('chats.fields.roomType')}
          value={t(`chats.roomType.${detail.roomType}`)}
        />
        <DetailField
          label={t('chats.fields.createdAt')}
          value={formatAdminMemberJoinedAt(detail.createdAt, locale)}
        />
        <DetailField
          label={t('chats.fields.lastMessageAt')}
          value={formatNullableDateTime(detail.lastMessageAt, locale)}
        />
      </dl>
    </DetailSection>
  );
};

interface ChatLinkedInfoSectionProps {
  detail: AdminChatDetail;
}

/** 연결 정보 섹션에 표시할 ID 행 */
interface ChatLinkedField {
  label: string;
  value: number;
}

/**
 * null이 아닌 연결 ID만 표시한다.
 * 전부 null이면 섹션 자체를 숨긴다.
 */
const ChatLinkedInfoSection = ({ detail }: ChatLinkedInfoSectionProps) => {
  const { t } = useTranslation();
  const linkedFields: ChatLinkedField[] = [];

  if (detail.estimateRequestId != null) {
    linkedFields.push({
      label: t('chats.fields.estimateRequestId'),
      value: detail.estimateRequestId,
    });
  }

  if (detail.quoteId != null) {
    linkedFields.push({
      label: t('chats.fields.quoteId'),
      value: detail.quoteId,
    });
  }

  if (detail.designatedMoverId != null) {
    linkedFields.push({
      label: t('chats.fields.designatedMoverId'),
      value: detail.designatedMoverId,
    });
  }

  if (detail.communityPostId != null) {
    linkedFields.push({
      label: t('chats.fields.communityPostId'),
      value: detail.communityPostId,
    });
  }

  if (linkedFields.length === 0) {
    return null;
  }

  return (
    <DetailSection title={t('chats.detail.linkedInfo')}>
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
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'ko';
  const isLeft = participant.leftAt != null;

  return (
    <div className="rounded-lg border border-line-100 bg-background-100 p-3">
      <dl className="flex flex-col gap-2 text-md-medium">
        <DetailField label={t('chats.fields.name')} value={participant.name} />
        <DetailField
          label={t('chats.fields.nickname')}
          value={participant.nickname}
        />
        <DetailField
          label={t('chats.fields.email')}
          value={participant.email}
        />
        <DetailField
          label={t('chats.fields.userType')}
          value={t(`chats.userType.${participant.userType}`)}
        />
        <DetailField
          label={t('chats.fields.joinedAt')}
          value={formatAdminMemberJoinedAt(participant.joinedAt, locale)}
        />
        <div className="flex items-center justify-between gap-4">
          <dt className="shrink-0 text-gray-500">
            {t('chats.fields.leftStatus')}
          </dt>
          <dd>
            <StatusBadge
              variant={isLeft ? 'neutral' : 'success'}
              label={t(
                isLeft ? 'chats.participant.left' : 'chats.participant.active'
              )}
            />
          </dd>
        </div>
        {isLeft ? (
          <DetailField
            label={t('chats.fields.leftAt')}
            value={formatNullableDateTime(participant.leftAt, locale)}
          />
        ) : null}
        {participant.isDeleted ? (
          <div className="flex items-center justify-between gap-4">
            <dt className="shrink-0 text-gray-500">
              {t('chats.fields.withdrawnStatus')}
            </dt>
            <dd>
              <StatusBadge
                variant="danger"
                label={t('chats.participant.withdrawn')}
              />
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
}: ChatParticipantsSectionProps) => {
  const { t } = useTranslation();
  return (
    <DetailSection title={t('chats.detail.participantInfo')}>
      {participants.length === 0 ? (
        <p className="text-md-regular text-gray-500">
          {t('chats.detail.noParticipants')}
        </p>
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
};

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
  const { t } = useTranslation();
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
          {t('chats.detail.noSelection')}
        </p>
      );
    }

    if (isPending) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <EmptyState
          title={t('chats.detail.error')}
          description={t('chats.common.retry')}
        />
      );
    }

    if (!isSuccess || !isDetailForSelection) {
      return (
        <EmptyState
          title={t('chats.detail.empty')}
          description={t('chats.detail.notFound')}
        />
      );
    }

    return <ChatDetailContent detail={detail} roomId={roomId} open={open} />;
  };

  return (
    <DetailDrawer
      open={open}
      title={t('chats.detail.title')}
      size="lg"
      onClose={onClose}
    >
      {renderBody()}
    </DetailDrawer>
  );
};
