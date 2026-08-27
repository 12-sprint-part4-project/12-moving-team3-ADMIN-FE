import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAdminMemberDetail } from '@/hooks/useAdminMemberDetail';
import {
  createQueryClientWrapper,
  createTestQueryClient,
} from '@/test/testUtils';

const { mockGetAdminMemberDetail } = vi.hoisted(() => ({
  mockGetAdminMemberDetail: vi.fn(),
}));

vi.mock('@/services/adminMemberApi', () => ({
  getAdminMemberDetail: mockGetAdminMemberDetail,
}));

const memberId = '550e8400-e29b-41d4-a716-446655440000';

const detailResponse = {
  data: {
    id: memberId,
    name: '홍길동',
    nickname: '길동',
    email: 'user@example.com',
    phoneNumber: '01012345678',
    profileImageKey: null,
    userType: 'CUSTOMER' as const,
    createdAt: '2026-08-01T00:00:00.000Z',
    userStatus: {
      status: 'ACTIVE' as const,
      suspendedAt: null,
      suspendedUntil: null,
    },
    customerProfile: null,
    moverProfile: null,
    reportCount: 0,
    averageRating: null,
    reviewCount: 0,
    confirmedQuoteCount: 0,
    prevId: null,
    nextId: null,
  },
};

describe('useAdminMemberDetail', () => {
  let queryClient = createTestQueryClient();

  beforeEach(() => {
    queryClient = createTestQueryClient();
    mockGetAdminMemberDetail.mockReset();
    mockGetAdminMemberDetail.mockResolvedValue(detailResponse);
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('memberId가 있으면 getAdminMemberDetail(memberId, query)를 호출한다', async () => {
    const query = { userType: 'CUSTOMER' as const, sort: 'DESC' as const };

    renderHook(() => useAdminMemberDetail(memberId, { query }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).toHaveBeenCalledWith(memberId, query);
    });
  });

  it('memberId가 undefined면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminMemberDetail(undefined), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).not.toHaveBeenCalled();
    });
  });

  it('memberId가 null이면 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminMemberDetail(null), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).not.toHaveBeenCalled();
    });
  });

  it('enabled: false면 memberId가 있어도 API를 호출하지 않는다', async () => {
    renderHook(() => useAdminMemberDetail(memberId, { enabled: false }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).not.toHaveBeenCalled();
    });
  });

  it('상세 query가 API에 전달된다', async () => {
    const query = {
      userType: 'MOVER' as const,
      userName: '기사',
      sort: 'ASC' as const,
    };

    renderHook(() => useAdminMemberDetail(memberId, { query }), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).toHaveBeenCalledWith(memberId, query);
    });
  });

  it('CUSTOMER와 MOVER 상세 query가 구분된다', async () => {
    const customerQuery = { userType: 'CUSTOMER' as const };
    const moverQuery = { userType: 'MOVER' as const };

    const { rerender } = renderHook(
      ({ query }) => useAdminMemberDetail(memberId, { query }),
      {
        initialProps: { query: customerQuery },
        wrapper: createQueryClientWrapper(queryClient),
      }
    );

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).toHaveBeenCalledWith(
        memberId,
        customerQuery
      );
    });

    rerender({ query: moverQuery });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).toHaveBeenCalledWith(
        memberId,
        moverQuery
      );
    });
  });

  it('memberId 변경 시 새로운 상세 데이터를 조회한다', async () => {
    const secondMemberId = '660e8400-e29b-41d4-a716-446655440001';

    const { rerender } = renderHook(({ id }) => useAdminMemberDetail(id), {
      initialProps: { id: memberId },
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).toHaveBeenCalledWith(
        memberId,
        undefined
      );
    });

    rerender({ id: secondMemberId });

    await waitFor(() => {
      expect(mockGetAdminMemberDetail).toHaveBeenCalledWith(
        secondMemberId,
        undefined
      );
    });
  });

  it('성공 데이터를 반환한다', async () => {
    const { result } = renderHook(() => useAdminMemberDetail(memberId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(detailResponse);
  });

  it('API 실패 시 error 상태를 반환한다', async () => {
    mockGetAdminMemberDetail.mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useAdminMemberDetail(memberId), {
      wrapper: createQueryClientWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });
});
