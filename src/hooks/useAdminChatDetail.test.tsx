import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminChatDetail } from '@/hooks/useAdminChatDetail';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminChatDetail } = vi.hoisted(() => ({
  mockGetAdminChatDetail: vi.fn(),
}));

vi.mock('@/services/adminChatApi', () => ({
  getAdminChatDetail: mockGetAdminChatDetail,
}));

const roomId = 42;

const detailResponse = {
  data: {
    id: roomId,
    roomType: 'GENERAL' as const,
    estimateRequestId: null,
    quoteId: null,
    designatedMoverId: null,
    communityPostId: null,
    lastMessageAt: null,
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-01T00:00:00.000Z',
    prevId: null,
    nextId: null,
    participants: [],
  },
};

describe('useAdminChatDetail', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminChatDetail.mockReset();
    mockGetAdminChatDetail.mockResolvedValue(detailResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('roomId가 있으면 getAdminChatDetail(roomId, query)를 호출한다', async () => {
    const query = { roomType: 'GENERAL' as const };

    renderHook(() => useAdminChatDetail(roomId, { query }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).toHaveBeenCalledWith(roomId, query);
    });
  });

  it('roomId가 undefined면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminChatDetail(undefined), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).not.toHaveBeenCalled();
    });
  });

  it('roomId가 null이면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminChatDetail(null), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).not.toHaveBeenCalled();
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminChatDetail(roomId, { enabled: false }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).not.toHaveBeenCalled();
    });
  });

  it('detail query를 전달한다', async () => {
    const query = { id: '42', userName: '홍길동' };

    renderHook(() => useAdminChatDetail(roomId, { query }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).toHaveBeenCalledWith(roomId, query);
    });
  });

  it('roomId 변경 시 새로운 상세를 조회한다', async () => {
    const secondRoomId = 99;

    const { rerender } = renderHook(({ id }) => useAdminChatDetail(id), {
      initialProps: { id: roomId },
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).toHaveBeenCalledWith(roomId, undefined);
    });

    rerender({ id: secondRoomId });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).toHaveBeenCalledWith(
        secondRoomId,
        undefined
      );
    });
  });

  it('query 변경 시 새로운 API 인자를 사용한다', async () => {
    const firstQuery = { roomType: 'GENERAL' as const };
    const secondQuery = { roomType: 'COMMUNITY' as const };

    const { rerender } = renderHook(
      ({ query }) => useAdminChatDetail(roomId, { query }),
      {
        initialProps: { query: firstQuery },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminChatDetail).toHaveBeenCalledWith(roomId, firstQuery);
    });

    rerender({ query: secondQuery });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).toHaveBeenCalledWith(roomId, secondQuery);
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(() => useAdminChatDetail(roomId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(detailResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminChatDetail.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAdminChatDetail(roomId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry가 없다', async () => {
    mockGetAdminChatDetail.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminChatDetail(roomId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatDetail).toHaveBeenCalledTimes(1);
    });
  });
});
