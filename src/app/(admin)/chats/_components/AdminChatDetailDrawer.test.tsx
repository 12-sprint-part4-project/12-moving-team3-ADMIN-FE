import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chatDetail, chatParticipant } from '@/test/adminChatFixtures';

const roomId = 42;

let detailHookReturn: {
  data?: { data: ReturnType<typeof chatDetail> };
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
} = {
  isPending: true,
  isError: false,
  isSuccess: false,
};

let capturedDetailHookArgs: {
  id?: number | null;
  options?: { enabled?: boolean; query?: Record<string, unknown> };
} = {};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useAdminChatDetail', () => ({
  useAdminChatDetail: (
    id: number | null | undefined,
    options?: { enabled?: boolean; query?: Record<string, unknown> }
  ) => {
    capturedDetailHookArgs = { id, options };
    return detailHookReturn;
  },
}));

vi.mock('./AdminChatMessageList', () => ({
  AdminChatMessageList: ({
    roomId: messageRoomId,
    enabled,
  }: {
    roomId: number;
    enabled: boolean;
  }) => (
    <div
      data-testid="message-list"
      data-room-id={messageRoomId}
      data-enabled={enabled}
    />
  ),
}));

const defaultDetailQuery = { roomType: 'GENERAL' as const };

const defaultProps = {
  open: true,
  roomId,
  detailQuery: defaultDetailQuery,
  onNavigate: vi.fn(),
  onClose: vi.fn(),
};

describe('AdminChatDetailDrawer', () => {
  afterEach(() => {
    vi.resetModules();
  });

  beforeEach(() => {
    capturedDetailHookArgs = {};
    detailHookReturn = {
      isPending: true,
      isError: false,
      isSuccess: false,
    };
  });

  const renderDrawer = async (props = defaultProps) => {
    const { AdminChatDetailDrawer } = await import('./AdminChatDetailDrawer');

    return render(<AdminChatDetailDrawer {...props} />);
  };

  it('open=false면 상세 조회를 비활성화한다', async () => {
    await renderDrawer({ ...defaultProps, open: false });

    expect(capturedDetailHookArgs.options?.enabled).toBe(false);
  });

  it('roomId=null이면 상세 조회를 비활성화한다', async () => {
    await renderDrawer({ ...defaultProps, roomId: null });

    expect(capturedDetailHookArgs.options?.enabled).toBe(false);
  });

  it('open=true와 roomId가 있으면 상세를 조회한다', async () => {
    await renderDrawer();

    expect(capturedDetailHookArgs.id).toBe(roomId);
    expect(capturedDetailHookArgs.options?.enabled).toBe(true);
  });

  it('detailQuery를 전달한다', async () => {
    const detailQuery = { userName: '홍길동', roomType: 'COMMUNITY' as const };

    await renderDrawer({ ...defaultProps, detailQuery });

    expect(capturedDetailHookArgs.options?.query).toEqual(detailQuery);
  });

  it('roomId가 없으면 선택 없음 상태를 표시한다', async () => {
    await renderDrawer({ ...defaultProps, roomId: null, open: true });

    expect(screen.getByText('chats.detail.noSelection')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', async () => {
    await renderDrawer();

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('API 오류 상태를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: true,
      isSuccess: false,
    };

    await renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'chats.detail.error' })
    ).toBeInTheDocument();
  });

  it('응답 detail.id가 현재 roomId와 다르면 빈 상태를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: chatDetail({ id: 99 }) },
    };

    await renderDrawer();

    expect(
      screen.getByRole('heading', { name: 'chats.detail.empty' })
    ).toBeInTheDocument();
  });

  it('정상 상세 정보를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: chatDetail({ id: roomId, roomType: 'GENERAL' }) },
    };

    await renderDrawer();

    expect(screen.getByText('chats.detail.basicInfo')).toBeInTheDocument();
    expect(screen.getByText('chats.roomType.GENERAL')).toBeInTheDocument();
  });

  it('연결 정보 중 null이 아닌 ID만 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: chatDetail({
          id: roomId,
          estimateRequestId: 10,
          quoteId: null,
          communityPostId: null,
        }),
      },
    };

    await renderDrawer();

    expect(screen.getByText('chats.detail.linkedInfo')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('연결 정보가 모두 null이면 섹션을 숨긴다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: chatDetail({
          id: roomId,
          estimateRequestId: null,
          quoteId: null,
          communityPostId: null,
          designatedMoverId: null,
        }),
      },
    };

    await renderDrawer();

    expect(
      screen.queryByText('chats.detail.linkedInfo')
    ).not.toBeInTheDocument();
  });

  it('참여자가 없으면 안내 문구를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: chatDetail({ id: roomId, participants: [] }) },
    };

    await renderDrawer();

    expect(screen.getByText('chats.detail.noParticipants')).toBeInTheDocument();
  });

  it('참여자 기본 정보를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: chatDetail({
          id: roomId,
          participants: [chatParticipant({ name: '홍길동', nickname: '길동' })],
        }),
      },
    };

    await renderDrawer();

    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('길동')).toBeInTheDocument();
  });

  it('참여 중 상태를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: chatDetail({
          id: roomId,
          participants: [chatParticipant({ leftAt: null })],
        }),
      },
    };

    await renderDrawer();

    expect(screen.getByText('chats.participant.active')).toBeInTheDocument();
  });

  it('퇴장 상태와 leftAt을 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: chatDetail({
          id: roomId,
          participants: [
            chatParticipant({ leftAt: '2026-08-20T15:00:00.000Z' }),
          ],
        }),
      },
    };

    await renderDrawer();

    expect(screen.getByText('chats.participant.left')).toBeInTheDocument();
    expect(screen.getByText('chats.fields.leftAt')).toBeInTheDocument();
  });

  it('탈퇴 사용자를 표시한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: {
        data: chatDetail({
          id: roomId,
          participants: [chatParticipant({ isDeleted: true })],
        }),
      },
    };

    await renderDrawer();

    expect(screen.getByText('chats.participant.withdrawn')).toBeInTheDocument();
  });

  it('정상 상세일 때 메시지 목록에 roomId와 enabled를 전달한다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: chatDetail({ id: roomId }) },
    };

    await renderDrawer();

    const messageList = screen.getByTestId('message-list');
    expect(messageList).toHaveAttribute('data-room-id', String(roomId));
    expect(messageList).toHaveAttribute('data-enabled', 'true');
  });

  it('prevId가 있으면 이전 이동이 가능하다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: chatDetail({ id: roomId, prevId: 41, nextId: null }) },
    };
    const onNavigate = vi.fn();

    await renderDrawer({ ...defaultProps, onNavigate });

    const previousButton = screen.getAllByRole('button', {
      name: 'chats.detail.previous',
    })[0];
    await userEvent.click(previousButton);

    expect(onNavigate).toHaveBeenCalledWith(41);
  });

  it('nextId가 있으면 다음 이동이 가능하다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: chatDetail({ id: roomId, prevId: null, nextId: 43 }) },
    };
    const onNavigate = vi.fn();

    await renderDrawer({ ...defaultProps, onNavigate });

    const nextButton = screen.getAllByRole('button', {
      name: 'chats.detail.next',
    })[0];
    await userEvent.click(nextButton);

    expect(onNavigate).toHaveBeenCalledWith(43);
  });

  it('prev/next가 null이면 이동이 비활성화된다', async () => {
    detailHookReturn = {
      isPending: false,
      isError: false,
      isSuccess: true,
      data: { data: chatDetail({ id: roomId, prevId: null, nextId: null }) },
    };

    await renderDrawer();

    expect(
      screen.getAllByRole('button', { name: 'chats.detail.previous' })[0]
    ).toBeDisabled();
    expect(
      screen.getAllByRole('button', { name: 'chats.detail.next' })[0]
    ).toBeDisabled();
  });

  it('닫기 callback을 호출한다', async () => {
    const onClose = vi.fn();

    await renderDrawer({ ...defaultProps, onClose });

    await userEvent.click(screen.getByLabelText('닫기'));

    expect(onClose).toHaveBeenCalled();
  });
});
