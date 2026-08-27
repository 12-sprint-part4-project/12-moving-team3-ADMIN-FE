import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminChatMessages } from '@/hooks/useAdminChatMessages';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminChatMessages } = vi.hoisted(() => ({
  mockGetAdminChatMessages: vi.fn(),
}));

vi.mock('@/services/adminChatApi', () => ({
  getAdminChatMessages: mockGetAdminChatMessages,
}));

const roomId = 42;

const messagesResponse = {
  data: {
    messages: [],
    meta: { hasNext: false, nextCursor: null },
  },
};

describe('useAdminChatMessages', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminChatMessages.mockReset();
    mockGetAdminChatMessages.mockResolvedValue(messagesResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('roomId와 { limit: 30 }으로 첫 페이지를 조회한다', async () => {
    renderHook(() => useAdminChatMessages(roomId, { limit: 30 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatMessages).toHaveBeenCalledWith(roomId, {
        limit: 30,
      });
    });
  });

  it('{ before, limit }로 이전 메시지 페이지를 조회한다', async () => {
    renderHook(() => useAdminChatMessages(roomId, { limit: 30, before: 100 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatMessages).toHaveBeenCalledWith(roomId, {
        limit: 30,
        before: 100,
      });
    });
  });

  it('roomId가 없으면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminChatMessages(null, { limit: 30 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatMessages).not.toHaveBeenCalled();
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(
      () => useAdminChatMessages(roomId, { limit: 30 }, { enabled: false }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminChatMessages).not.toHaveBeenCalled();
    });
  });

  it('before 변경 시 새로운 query key를 사용한다', async () => {
    const { rerender } = renderHook(
      ({ params }) => useAdminChatMessages(roomId, params),
      {
        initialProps: { params: { limit: 30 } },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminChatMessages).toHaveBeenCalledWith(roomId, {
        limit: 30,
      });
    });

    rerender({ params: { limit: 30, before: 50 } });

    await waitFor(() => {
      expect(mockGetAdminChatMessages).toHaveBeenCalledWith(roomId, {
        limit: 30,
        before: 50,
      });
    });
  });

  it('roomId 변경 시 다른 메시지 캐시를 사용한다', async () => {
    const secondRoomId = 99;

    const { rerender } = renderHook(
      ({ id }) => useAdminChatMessages(id, { limit: 30 }),
      {
        initialProps: { id: roomId },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminChatMessages).toHaveBeenCalledWith(roomId, {
        limit: 30,
      });
    });

    rerender({ id: secondRoomId });

    await waitFor(() => {
      expect(mockGetAdminChatMessages).toHaveBeenCalledWith(secondRoomId, {
        limit: 30,
      });
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(
      () => useAdminChatMessages(roomId, { limit: 30 }),
      { wrapper: createQueryClientWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(messagesResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminChatMessages.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(
      () => useAdminChatMessages(roomId, { limit: 30 }),
      { wrapper: createQueryClientWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry가 없다', async () => {
    mockGetAdminChatMessages.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminChatMessages(roomId, { limit: 30 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatMessages).toHaveBeenCalledTimes(1);
    });
  });
});
