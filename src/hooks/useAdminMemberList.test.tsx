import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminMemberList } from '@/hooks/useAdminMemberList';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminMemberList } = vi.hoisted(() => ({
  mockGetAdminMemberList: vi.fn(),
}));

vi.mock('@/services/adminMemberApi', () => ({
  getAdminMemberList: mockGetAdminMemberList,
}));

const listResponse = {
  data: {
    items: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: '홍길동',
        nickname: '길동',
        email: 'user@example.com',
        phoneNumber: '01012345678',
        userType: 'CUSTOMER' as const,
        status: 'ACTIVE' as const,
        suspendedAt: null,
        suspendedUntil: null,
        createdAt: '2026-08-01T00:00:00.000Z',
        averageRating: null,
      },
    ],
    pagination: {
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    },
  },
};

describe('useAdminMemberList', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminMemberList.mockReset();
    mockGetAdminMemberList.mockResolvedValue(listResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('CUSTOMER params로 getAdminMemberList를 호출한다', async () => {
    const params = { userType: 'CUSTOMER' as const, page: 1, pageSize: 10 };

    renderHook(() => useAdminMemberList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberList).toHaveBeenCalledWith(params);
    });
  });

  it('MOVER params로 getAdminMemberList를 호출한다', async () => {
    const params = { userType: 'MOVER' as const, page: 2, pageSize: 10 };

    renderHook(() => useAdminMemberList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberList).toHaveBeenCalledWith(params);
    });
  });

  it('enabled: false면 API를 호출하지 않는다', async () => {
    renderHook(
      () =>
        useAdminMemberList(
          { userType: 'CUSTOMER', page: 1, pageSize: 10 },
          { enabled: false }
        ),
      { wrapper: createQueryClientWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(mockGetAdminMemberList).not.toHaveBeenCalled();
    });
  });

  it('options가 없으면 기본 활성화된다', async () => {
    const params = { userType: 'CUSTOMER' as const, page: 1, pageSize: 10 };

    renderHook(() => useAdminMemberList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberList).toHaveBeenCalledTimes(1);
    });
  });

  it('params 변경 시 새로운 queryKey와 API 인자를 사용한다', async () => {
    const customerParams = {
      userType: 'CUSTOMER' as const,
      page: 1,
      pageSize: 10,
    };
    const moverParams = { userType: 'MOVER' as const, page: 1, pageSize: 10 };

    const { rerender } = renderHook(
      ({ params }) => useAdminMemberList(params),
      {
        initialProps: { params: customerParams },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminMemberList).toHaveBeenCalledWith(customerParams);
    });

    rerender({ params: moverParams });

    await waitFor(() => {
      expect(mockGetAdminMemberList).toHaveBeenCalledWith(moverParams);
    });
  });

  it('성공 데이터를 Hook 결과로 반환한다', async () => {
    const params = { userType: 'CUSTOMER' as const, page: 1, pageSize: 10 };

    const { result } = renderHook(() => useAdminMemberList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(listResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminMemberList.mockRejectedValue(new Error('network error'));
    const params = { userType: 'CUSTOMER' as const, page: 1, pageSize: 10 };

    const { result } = renderHook(() => useAdminMemberList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  it('retry: false로 같은 실패 요청을 반복 호출하지 않는다', async () => {
    mockGetAdminMemberList.mockRejectedValue(new Error('network error'));
    const params = { userType: 'CUSTOMER' as const, page: 1, pageSize: 10 };

    renderHook(() => useAdminMemberList(params), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberList).toHaveBeenCalledTimes(1);
    });
  });
});
