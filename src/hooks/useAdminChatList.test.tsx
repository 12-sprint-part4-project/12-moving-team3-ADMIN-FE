import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminChatList } from '@/hooks/useAdminChatList';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminChatList } = vi.hoisted(() => ({
  mockGetAdminChatList: vi.fn(),
}));

vi.mock('@/services/adminChatApi', () => ({
  getAdminChatList: mockGetAdminChatList,
}));

const listResponse = {
  data: {
    items: [
      {
        id: 42,
        roomType: 'GENERAL' as const,
        estimateRequestId: null,
        quoteId: null,
        communityPostId: null,
        lastMessageAt: '2026-08-20T12:00:00.000Z',
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-20T12:00:00.000Z',
        participants: [],
        lastMessage: null,
      },
    ],
    pagination: { page: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
  },
};

describe('useAdminChatList', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminChatList.mockReset();
    mockGetAdminChatList.mockResolvedValue(listResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('params로 getAdminChatList를 호출한다', async () => {
    const params = { page: 2, pageSize: 10, roomType: 'GENERAL' as const };

    renderHook(() => useAdminChatList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatList).toHaveBeenCalledWith(params);
    });
  });

  it('params 없이 getAdminChatList를 호출한다', async () => {
    renderHook(() => useAdminChatList(), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatList).toHaveBeenCalledWith(undefined);
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(
      () => useAdminChatList({ page: 1, pageSize: 10 }, { enabled: false }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminChatList).not.toHaveBeenCalled();
    });
  });

  it('기본 enabled는 true다', async () => {
    renderHook(() => useAdminChatList({ page: 1, pageSize: 10 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatList).toHaveBeenCalledTimes(1);
    });
  });

  it('필터 또는 page 변경 시 새로운 query를 호출한다', async () => {
    const firstParams = { page: 1, pageSize: 10 };
    const secondParams = { page: 2, pageSize: 10, userName: '홍길동' };

    const { rerender } = renderHook(({ params }) => useAdminChatList(params), {
      initialProps: { params: firstParams },
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatList).toHaveBeenCalledWith(firstParams);
    });

    rerender({ params: secondParams });

    await waitFor(() => {
      expect(mockGetAdminChatList).toHaveBeenCalledWith(secondParams);
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(
      () => useAdminChatList({ page: 1, pageSize: 10 }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(listResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminChatList.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(
      () => useAdminChatList({ page: 1, pageSize: 10 }),
      {
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 실패 요청을 반복하지 않는다', async () => {
    mockGetAdminChatList.mockRejectedValue(new Error('network error'));

    renderHook(() => useAdminChatList({ page: 1, pageSize: 10 }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminChatList).toHaveBeenCalledTimes(1);
    });
  });
});
