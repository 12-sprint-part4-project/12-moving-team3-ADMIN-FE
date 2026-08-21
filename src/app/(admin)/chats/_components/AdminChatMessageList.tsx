'use client';

import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/Button/Button';
import { DetailSection } from '@/components/DetailSection/DetailSection';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { LoadingState } from '@/components/LoadingState/LoadingState';
import { StatusBadge } from '@/components/StatusBadge/StatusBadge';
import { ADMIN_CHAT_QUERY_KEYS } from '@/constants/adminChatQueryKeys';
import { useAdminChatMessages } from '@/hooks/useAdminChatMessages';
import { formatAdminChatUserLabel } from '@/utils/adminChat';
import { sortAdminChatMessagesByCreatedAtDesc } from '@/utils/adminChatMessages';
import { formatAdminMemberJoinedAt } from '@/utils/adminMember';

import type {
  AdminChatMessage,
  AdminChatMessagesQuery,
} from '@/types/adminChat';

const MESSAGE_PAGE_LIMIT = 30;

export interface AdminChatMessageListProps {
  roomId: number;
  /** Drawer open 여부와 함께 넘겨 닫힌 동안 조회를 막는다. */
  enabled: boolean;
}

/** id 기준 병합 후 생성 시각 최신순 정렬. 추가 페이지 누적·중복 방어에 쓴다. */
const mergeMessagesById = (
  existing: AdminChatMessage[],
  incoming: AdminChatMessage[]
) => {
  const byId = new Map<number, AdminChatMessage>();

  for (const message of existing) {
    byId.set(message.id, message);
  }

  for (const message of incoming) {
    byId.set(message.id, message);
  }

  return sortAdminChatMessagesByCreatedAtDesc([...byId.values()]);
};

interface AdminChatMessageItemProps {
  message: AdminChatMessage;
}

const AdminChatMessageItem = ({ message }: AdminChatMessageItemProps) => {
  const senderLabel = formatAdminChatUserLabel(message.sender);
  // 필터링된 메시지는 관리자가 원문을 보도록 rawContent를 우선 표시한다.
  // content/rawContent API 계약은 유지하고, 표시만 UI에서 선택한다.
  const displayContent =
    message.isFiltered && message.rawContent !== null
      ? message.rawContent
      : message.content;

  return (
    <li className="rounded-lg border border-line-100 bg-background-100 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p data-i18n-ignore className="text-md-semibold text-black-400">
          {senderLabel}
        </p>
        {message.sender.isDeleted ? (
          <StatusBadge variant="danger" label="탈퇴" />
        ) : null}
        {message.isFiltered ? (
          <StatusBadge variant="warning" label="필터링됨" />
        ) : null}
        <time
          className="ml-auto text-xs-medium text-gray-400"
          dateTime={message.createdAt}
        >
          {formatAdminMemberJoinedAt(message.createdAt)}
        </time>
      </div>

      <div className="mt-2">
        {message.messageType === 'IMAGE' ? (
          message.attachments.length > 0 ? (
            <ul className="grid grid-cols-2 gap-2">
              {message.attachments.map((url) => (
                <li
                  key={url}
                  className="overflow-hidden rounded-md border border-line-200 bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- Presigned URL은 next/image remotePatterns 없이 img로 표시한다. */}
                  <img
                    src={url}
                    alt="채팅 이미지"
                    className="max-h-48 w-full object-contain"
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-md-regular text-gray-500">
              이미지를 불러올 수 없습니다.
            </p>
          )
        ) : (
          <p
            data-i18n-ignore
            className="text-md-regular break-words whitespace-pre-wrap text-black-400"
          >
            {displayContent}
          </p>
        )}
      </div>
    </li>
  );
};

/**
 * 관리자 채팅 메시지 히스토리(읽기 전용).
 * 첫 페이지는 query 응답을 그대로 파생하고, 더 보기 클릭 시에만 이전 페이지를 스냅샷·누적한다.
 * room 전환 시 부모에서 key={roomId}로 리마운트해 누적 상태를 초기화한다.
 */
export const AdminChatMessageList = ({
  roomId,
  enabled,
}: AdminChatMessageListProps) => {
  const queryClient = useQueryClient();
  /** 더 보기 전에 화면에 있던 메시지 스냅샷. 첫 페이지만 볼 때는 비어 있다. */
  const [frozenMessages, setFrozenMessages] = useState<AdminChatMessage[]>([]);
  const [before, setBefore] = useState<number | undefined>(undefined);

  const params = useMemo((): AdminChatMessagesQuery => {
    return {
      limit: MESSAGE_PAGE_LIMIT,
      ...(before !== undefined ? { before } : {}),
    };
  }, [before]);

  const { data, isPending, isError, isFetching, isSuccess, refetch } =
    useAdminChatMessages(roomId, params, { enabled });

  const messages = useMemo(() => {
    const livePageMessages = isSuccess && data?.data ? data.data.messages : [];

    // 첫 페이지: 원본 생성 시각 기준 최신순으로 정렬해 보여준다.
    if (before === undefined) {
      return sortAdminChatMessagesByCreatedAtDesc(livePageMessages);
    }

    // 추가 페이지: 클릭 시 얼린 목록 + 현재 페이지를 id 기준으로 병합한다.
    return mergeMessagesById(frozenMessages, livePageMessages);
  }, [before, frozenMessages, isSuccess, data]);

  const isInitialLoading = isPending && before === undefined;
  const isLoadMoreLoading = isFetching && before !== undefined;
  const isRefreshing = isFetching && before === undefined;
  const nextCursor = data?.data.meta.nextCursor ?? null;
  const canLoadOlder = data?.data.meta.hasNext === true && nextCursor != null;
  const canRetryLoadOlder = isError && before !== undefined;

  const handleLoadOlder = () => {
    if (isFetching) {
      return;
    }

    if (canRetryLoadOlder) {
      void refetch();
      return;
    }

    if (!canLoadOlder) {
      return;
    }

    // 다음 요청 전에 현재 화면 메시지를 고정해, fetch 중에도 목록이 비지 않게 한다.
    setFrozenMessages(messages);
    setBefore(nextCursor);
  };

  const handleRefresh = () => {
    if (isFetching) {
      return;
    }

    if (before === undefined) {
      void refetch();
      return;
    }

    // 과거 페이지가 활성 query인 경우 최신 첫 페이지 캐시를 stale 처리한 뒤 돌아간다.
    void queryClient.invalidateQueries({
      queryKey: ADMIN_CHAT_QUERY_KEYS.messageList(roomId, {
        limit: MESSAGE_PAGE_LIMIT,
      }),
      exact: true,
      refetchType: 'none',
    });
    setFrozenMessages([]);
    setBefore(undefined);
  };

  const renderBody = () => {
    if (isInitialLoading) {
      return <LoadingState message="메시지를 불러오는 중..." />;
    }

    if (isError && before === undefined) {
      return (
        <EmptyState
          title="메시지를 불러오지 못했습니다."
          description="잠시 후 다시 시도해 주세요."
          action={
            <Button variant="secondary" onClick={() => void refetch()}>
              다시 시도
            </Button>
          }
        />
      );
    }

    if (messages.length === 0) {
      return (
        <p className="py-6 text-center text-md-regular text-gray-500">
          메시지 내역이 없습니다.
        </p>
      );
    }

    return (
      <div className="flex flex-col gap-3">
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <AdminChatMessageItem key={message.id} message={message} />
          ))}
        </ul>

        <div className="flex flex-col items-center gap-2">
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-sm-medium"
            loading={isLoadMoreLoading}
            disabled={isFetching || (!canLoadOlder && !canRetryLoadOlder)}
            onClick={handleLoadOlder}
          >
            이전 메시지 더 보기
          </Button>
          {canRetryLoadOlder ? (
            <p className="text-xs-medium text-red-200">
              이전 메시지를 불러오지 못했습니다.
            </p>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <DetailSection
      title="메시지 히스토리"
      headerAction={
        <Button
          variant="secondary"
          className="size-7 p-0"
          loading={isRefreshing}
          disabled={!enabled || isFetching}
          onClick={handleRefresh}
          aria-label="메시지 새로고침"
          title="메시지 새로고침"
        >
          <RefreshCw className="size-4" aria-hidden />
        </Button>
      }
    >
      {renderBody()}
    </DetailSection>
  );
};
