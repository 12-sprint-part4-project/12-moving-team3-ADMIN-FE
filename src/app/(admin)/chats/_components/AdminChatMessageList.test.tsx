import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ADMIN_CHAT_QUERY_KEYS } from '@/constants/adminChatQueryKeys';
import { chatMessage } from '@/test/adminChatFixtures';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

import type { AdminChatMessagesQuery } from '@/types/adminChat';

const roomId = 42;

const { mockRefetch, hookState } = vi.hoisted(() => ({
  mockRefetch: vi.fn(),
  hookState: {
    isPending: false,
    isError: false,
    isFetching: false,
    messages: [
      {
        id: 2,
        senderId: 'user-1',
        sender: {
          id: 'user-1',
          name: '홍길동',
          nickname: '길동',
          email: 'user@example.com',
          userType: 'CUSTOMER' as const,
          isDeleted: false,
        },
        messageType: 'TEXT' as const,
        content: 'newer',
        rawContent: null,
        isFiltered: false,
        attachments: [],
        createdAt: '2026-08-20T12:00:00.000Z',
      },
    ],
    meta: { hasNext: true, nextCursor: 100 },
    olderMessages: [
      {
        id: 1,
        senderId: 'user-1',
        sender: {
          id: 'user-1',
          name: '홍길동',
          nickname: '길동',
          email: 'user@example.com',
          userType: 'CUSTOMER' as const,
          isDeleted: false,
        },
        messageType: 'TEXT' as const,
        content: 'older',
        rawContent: null,
        isFiltered: false,
        attachments: [],
        createdAt: '2026-08-20T10:00:00.000Z',
      },
    ],
    olderError: false,
  },
}));

let capturedMessagesArgs: {
  roomId?: number | null;
  params?: AdminChatMessagesQuery;
  enabled?: boolean;
} = {};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { resolvedLanguage: 'ko' },
  }),
}));

vi.mock('@/hooks/useAdminChatMessages', () => ({
  useAdminChatMessages: (
    id: number | null | undefined,
    params?: AdminChatMessagesQuery,
    options?: { enabled?: boolean }
  ) => {
    capturedMessagesArgs = { roomId: id, params, enabled: options?.enabled };

    if (hookState.isPending) {
      return {
        data: undefined,
        isPending: true,
        isError: false,
        isFetching: false,
        isSuccess: false,
        refetch: mockRefetch,
      };
    }

    if (params?.before === 100) {
      return {
        data: hookState.olderError
          ? undefined
          : {
              data: {
                messages: hookState.olderMessages,
                meta: { hasNext: false, nextCursor: null },
              },
            },
        isPending: false,
        isError: hookState.olderError,
        isFetching: hookState.isFetching,
        isSuccess: !hookState.olderError,
        refetch: mockRefetch,
      };
    }

    if (hookState.isError) {
      return {
        data: undefined,
        isPending: false,
        isError: true,
        isFetching: false,
        isSuccess: false,
        refetch: mockRefetch,
      };
    }

    return {
      data: {
        data: {
          messages: hookState.messages,
          meta: hookState.meta,
        },
      },
      isPending: false,
      isError: false,
      isFetching: hookState.isFetching,
      isSuccess: true,
      refetch: mockRefetch,
    };
  },
}));

describe('AdminChatMessageList', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockRefetch.mockReset();
    capturedMessagesArgs = {};
    hookState.isPending = false;
    hookState.isError = false;
    hookState.isFetching = false;
    hookState.olderError = false;
    hookState.messages = [
      chatMessage({
        id: 2,
        content: 'newer',
        createdAt: '2026-08-20T12:00:00.000Z',
      }),
    ];
    hookState.meta = { hasNext: true, nextCursor: 100 };
    hookState.olderMessages = [
      chatMessage({
        id: 1,
        content: 'older',
        createdAt: '2026-08-20T10:00:00.000Z',
      }),
    ];
  });

  afterEach(() => {
    queryClient.clear();
    vi.resetModules();
  });

  const renderList = async (enabled = true) => {
    const { AdminChatMessageList } = await import('./AdminChatMessageList');

    return render(<AdminChatMessageList roomId={roomId} enabled={enabled} />, {
      wrapper: createQueryClientWrapper(queryClient),
    });
  };

  it('첫 요청은 { limit: 30 }을 사용한다', async () => {
    await renderList();

    expect(capturedMessagesArgs.params).toEqual({ limit: 30 });
  });

  it('enabled를 전달한다', async () => {
    await renderList(false);

    expect(capturedMessagesArgs.enabled).toBe(false);
  });

  it('초기 로딩 상태를 표시한다', async () => {
    hookState.isPending = true;

    await renderList();

    expect(screen.getAllByRole('status')[0]).toBeInTheDocument();
  });

  it('첫 페이지 오류 상태를 표시한다', async () => {
    hookState.isError = true;

    await renderList();

    expect(
      screen.getByRole('heading', { name: 'chats.messages.error' })
    ).toBeInTheDocument();
  });

  it('첫 페이지 재시도 버튼이 refetch를 호출한다', async () => {
    hookState.isError = true;

    await renderList();

    await userEvent.click(
      screen.getByRole('button', { name: 'chats.common.retryAction' })
    );

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('메시지가 없으면 빈 문구를 표시한다', async () => {
    hookState.messages = [];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getByText('chats.messages.empty')).toBeInTheDocument();
  });

  it('발신자 label을 표시한다', async () => {
    await renderList();

    expect(
      screen.getByText('길동(chats.userType.CUSTOMER)')
    ).toBeInTheDocument();
  });

  it('일반 TEXT content를 표시한다', async () => {
    await renderList();

    expect(screen.getByText('newer')).toBeInTheDocument();
  });

  it('필터링 메시지는 rawContent를 표시한다', async () => {
    hookState.messages = [
      chatMessage({
        id: 1,
        content: '***',
        rawContent: '원문 메시지',
        isFiltered: true,
      }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getByText('원문 메시지')).toBeInTheDocument();
  });

  it('필터링 메시지의 rawContent가 null이면 content를 표시한다', async () => {
    hookState.messages = [
      chatMessage({
        id: 1,
        content: '마스킹된 내용',
        rawContent: null,
        isFiltered: true,
      }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getByText('마스킹된 내용')).toBeInTheDocument();
  });

  it('필터링 Badge를 표시한다', async () => {
    hookState.messages = [
      chatMessage({ id: 1, isFiltered: true, rawContent: '원문' }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getByText('chats.messages.filtered')).toBeInTheDocument();
  });

  it('탈퇴 발신자 Badge를 표시한다', async () => {
    hookState.messages = [
      chatMessage({
        id: 1,
        sender: {
          id: 'user',
          name: '탈퇴자',
          nickname: '탈퇴',
          email: 'del@example.com',
          userType: 'CUSTOMER',
          isDeleted: true,
        },
      }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getByText('chats.participant.withdrawn')).toBeInTheDocument();
  });

  it('IMAGE 메시지 attachment를 렌더링한다', async () => {
    hookState.messages = [
      chatMessage({
        id: 1,
        messageType: 'IMAGE',
        content: '',
        attachments: ['https://example.com/image.jpg'],
      }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getByAltText('chats.messages.imageAlt')).toBeInTheDocument();
  });

  it('이미지 attachment가 없으면 fallback을 표시한다', async () => {
    hookState.messages = [
      chatMessage({
        id: 1,
        messageType: 'IMAGE',
        content: '',
        attachments: [],
      }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getByText('chats.messages.imageError')).toBeInTheDocument();
  });

  it('여러 attachment를 렌더링한다', async () => {
    hookState.messages = [
      chatMessage({
        id: 1,
        messageType: 'IMAGE',
        content: '',
        attachments: ['https://example.com/1.jpg', 'https://example.com/2.jpg'],
      }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(screen.getAllByAltText('chats.messages.imageAlt')).toHaveLength(2);
  });

  it('createdAt 최신순으로 메시지를 표시한다', async () => {
    hookState.messages = [
      chatMessage({
        id: 1,
        content: 'older',
        createdAt: '2026-08-20T10:00:00.000Z',
      }),
      chatMessage({
        id: 2,
        content: 'newer',
        createdAt: '2026-08-20T12:00:00.000Z',
      }),
    ];
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveTextContent('newer');
    expect(items[1]).toHaveTextContent('older');
  });

  it('이전 메시지 더 보기 클릭 시 before cursor로 조회한다', async () => {
    await renderList();

    await userEvent.click(
      screen.getByRole('button', { name: 'chats.messages.loadOlder' })
    );

    await waitFor(() => {
      expect(capturedMessagesArgs.params).toEqual({ limit: 30, before: 100 });
    });
  });

  it('이전 페이지 조회 중 기존 메시지가 사라지지 않는다', async () => {
    await renderList();

    await userEvent.click(
      screen.getByRole('button', { name: 'chats.messages.loadOlder' })
    );

    await waitFor(() => {
      expect(screen.getByText('newer')).toBeInTheDocument();
      expect(screen.getByText('older')).toBeInTheDocument();
    });
  });

  it('중복 ID는 Map 병합 규칙으로 최신 페이지 값을 유지한다', async () => {
    hookState.olderMessages = [
      chatMessage({
        id: 2,
        content: 'updated-from-older-page',
        createdAt: '2026-08-20T12:00:00.000Z',
      }),
    ];

    await renderList();

    await userEvent.click(
      screen.getByRole('button', { name: 'chats.messages.loadOlder' })
    );

    await waitFor(() => {
      expect(screen.getByText('updated-from-older-page')).toBeInTheDocument();
      expect(screen.queryByText('newer')).not.toBeInTheDocument();
    });
  });

  it('더 불러올 페이지가 없으면 버튼을 비활성화한다', async () => {
    hookState.meta = { hasNext: false, nextCursor: null };

    await renderList();

    expect(
      screen.getByRole('button', { name: 'chats.messages.loadOlder' })
    ).toBeDisabled();
  });

  it('조회 중 중복 클릭을 방지한다', async () => {
    hookState.isFetching = true;

    await renderList();

    expect(
      screen.getByRole('button', { name: 'chats.messages.loadOlder' })
    ).toBeDisabled();
  });

  it('이전 페이지 조회 실패 시 오류 문구를 표시한다', async () => {
    await renderList();

    hookState.olderError = true;
    await userEvent.click(
      screen.getByRole('button', { name: 'chats.messages.loadOlder' })
    );

    await waitFor(() => {
      expect(
        screen.getByText('chats.messages.loadOlderError')
      ).toBeInTheDocument();
    });
  });

  it('첫 페이지 상태에서 새로고침하면 refetch를 호출한다', async () => {
    await renderList();

    await userEvent.click(screen.getByLabelText('chats.messages.refresh'));

    expect(mockRefetch).toHaveBeenCalled();
  });

  it('fetch 중에는 새로고침을 방지한다', async () => {
    hookState.isFetching = true;

    await renderList();

    expect(screen.getByLabelText('chats.messages.refresh')).toBeDisabled();
  });

  it('이전 페이지를 보고 있을 때 새로고침하면 첫 페이지 query를 invalidate한다', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await renderList();

    await userEvent.click(
      screen.getByRole('button', { name: 'chats.messages.loadOlder' })
    );

    await waitFor(() => {
      expect(capturedMessagesArgs.params?.before).toBe(100);
    });

    hookState.isFetching = false;
    await userEvent.click(screen.getByLabelText('chats.messages.refresh'));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ADMIN_CHAT_QUERY_KEYS.messageList(roomId, { limit: 30 }),
      exact: true,
      refetchType: 'none',
    });
  });
});
